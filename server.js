const express = require("express");
const { syncDatabase } = require("./models");
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const passport = require('passport');
const rateLimit = require("express-rate-limit");
const bcrypt = require('bcrypt')
const app = express();
app.use(express.json());

const users = []
//Define Routes
app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10); //Higher salt number higher security, salt over 20 may get days to generate
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const new_user = { name: req.body.name, password: hashedPassword }
        users.push(new_user)
        res.status(201).send("Success")
    } catch (err) {
        console.log(err)
        res.status(500).send("Unexpected Error")
    }


})

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name = req.body.name)
    if (user == null) {
        return res.status(400).send("Can't find the user")
    }
    try {
        if (
           await bcrypt.compare(req.body.password, user.password)
        ) {
            res.send("Login Successfully")
        } else {
            res.send("Wrong Password")
        }
    } catch (err) {
        console.log(err)
        res.status(500).send("Unexpected Error")
    }
})
//Main Routes

//Misc routes

//Misc middleware

//Middleware CORS
const allowedURL = process.env.CORS_URL.split(',');
app.use(cors({
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
    origin: allowedURL
}));
app.disable('etag');

// Logging
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
morgan.token('date', function () {
    return moment().format("DD-MM-YYYY, h:mm:ss a");
});

app.use(morgan('[:date] :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ------------- Passport Middleware -------------- //
// app.use(passport.initialize());

// ---------- Passport Configuration --------------//
// require('./config/passport')(passport);
// Use Routes
// Main Routes  

//MISC Routes

app.use(async function (req, res, next) {
    res.status(404).send("APINOTFOUND");
})

app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', async error => {
    common.logging("ERROR", "[" + moment().format("DD-MM-YYYY, h:mm:ss a") + "]" + error ? error.original ? JSON.stringify(error.original) : JSON.stringify(error) : "" + "\n");
    console.log(error);
})

process.on('unhandledRejection', async error => {
    common.logging("ERROR", "[" + moment().format("DD-MM-YYYY, h:mm:ss a") + "]" + error ? error.original ? JSON.stringify(error.original) : JSON.stringify(error) : "" + "\n");
    console.log(error);
})



// Sync database on startup
syncDatabase();

// SECURITY //
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

//CRON Define

//CRON Backup job app.use()

app.listen(3000, () => {
    console.log("=================================== Server started ===================================");
    console.log(new Date() + "Server running on port 3000");
});
