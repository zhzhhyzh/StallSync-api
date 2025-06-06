const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const common = require("./common/common");

// ------------  ROUTE DEFINE ----------------- //
// Main Routes
const psusrprf = require("./routes/psusrprf");
// MISC Routes
const document = require('./routes/document');
const mntlog = require('./routes/mntlog');

const app = express();
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3001', 'http://localhost:3000']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
morgan.token('date', function () {
    return moment().format("DD-MM-YYYY, h:mm:ss a");
});

app.use(morgan('[:date] :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));

// ------------- Passport Middleware -------------- //
app.use(passport.initialize());

// ---------- Passport Configuration --------------//
require('./config/passport')(passport);
// Use Routes
// Main Routes 
app.use('/api/psusrprf', psusrprf);

//When there is no API found
app.use(async function (req, res, next) {
    res.status(404).send("APINOTFOUND");
})

//Logging for 500
process.on('uncaughtException', async error => {
    common.logging("ERROR", "[" + moment().format("DD-MM-YYYY, h:mm:ss a") + "]" + error ? error.original ? JSON.stringify(error.original) : JSON.stringify(error) : "" + "\n");
    console.log(error);
    process.exit(1)
})

//Logging for 400
process.on('unhandledRejection', async error => {
    common.logging("ERROR", "[" + moment().format("DD-MM-YYYY, h:mm:ss a") + "]" + error ? error.original ? JSON.stringify(error.original) : JSON.stringify(error) : "" + "\n");
    console.log(error);
    process.exit(1)
})

app.disable('etag');
const db = require("./models");
db.sequelize.sync();

// SECURITY //
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// -- Cron Definition -- //
// Socket
const port = process.env.PORT || 8080;

console.log('===Server Start===')
app.listen(port, () => console.log(`Server running on Port ${port}`));

