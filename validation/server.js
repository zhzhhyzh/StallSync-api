const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const returnError = require("./common/error");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const common = require("./common/common");
const exphbs = require("express-handlebars");

const router = express.Router();
// ------------  ROUTE DEFINE ----------------- //
// Main Routes
const prgencde = require('./routes/prgencde');
const psprdrsk = require('./routes/psprdrsk');
const prgentyp = require('./routes/prgentyp');
const prfuncde = require('./routes/prfuncde');
const prfunacs = require('./routes/prfunacs');
const pssysann = require("./routes/pssysann");
const psusrprf = require("./routes/psusrprf");
const psprdtyp = require("./routes/psprdtyp");
const pscncpar = require("./routes/pscncpar");
const psprdcat = require("./routes/psprdcat");
const psvchpar = require("./routes/psvchpar");
const psprdpar = require("./routes/psprdpar")
const pstrnscd = require("./routes/pstrnscd");
const dashboard = require("./routes/dashboard");
const pscrdpar = require("./routes/pscrdpar");
const pscampgn = require("./routes/pscampgn");
const pscament = require("./routes/pscament");
const mcmaster = require("./routes/mcmaster");
const mcmchpic = require("./routes/mcmchpic");
const psmbrprf = require("./routes/psmbrprf");
const mcmercat = require("./routes/mcmercat");
const pstiepar = require("./routes/pstiepar");
const psmbrtrx = require("./routes/psmbrtrx");
const psmbrvch = require("./routes/psmbrvch");
const psotppar = require("./routes/psotppar");
const pstiepri = require("./routes/pstiepri");
const psvchitm = require("./routes/psvchitm");
const psbnrimg = require("./routes/psbnrimg");
const psmbrprg = require("./routes/psmbrprg");
const pstblmas = require("./routes/pstblmas");
const psrompar = require("./routes/psrompar");
const psromjnp = require("./routes/psromjnp");
const psromimg = require("./routes/psromimg");
const psresvpf = require("./routes/psresvpf");
const psrbkpar = require("./routes/psrbkpar");
const psrstpar = require("./routes/psrstpar");
const psresvwl = require("./routes/psresvwl");
const application = require("./routes/application");
const psfacpar = require("./routes/psfacpar");
const psfcspar = require("./routes/psfcspar");
const pswalpar = require("./routes/pswalpar");
const psmbrwlt = require("./routes/psmbrwlt");
const sales = require("./routes/sales");
const pspympar = require("./routes/pspympar");
const psnotipf = require("./routes/psnotipf");
const psnotmda = require("./routes/psnotmda");
const psnotsgp = require("./routes/psnotsgp");
const psnotgrp = require("./routes/psnotgrp");
const psnotgrd = require("./routes/psnotgrd");
const pschnpar = require("./routes/pschnpar");
const pschnncp = require("./routes/pschnncp");
const pscmkpar = require("./routes/pscmkpar");
const pscmkrqt = require("./routes/pscmkrqt");
const pstrcpar = require("./routes/pstrcpar");
const prawrkgrp = require("./routes/prawrkgrp");
const pstrnsrm = require("./routes/pstrnsrm");
const payment = require("./routes/payment");
const prrpttmp = require("./routes/prrpttmp");
const psfappar = require("./routes/psfappar");
const psrsvuid = require("./routes/psrsvuid");
const pass = require("./routes/pass");
const pspaspar = require("./routes/pspaspar");

// MISC Routes
const document = require('./routes/document');
const report = require("./routes/report");
const mntlog = require('./routes/mntlog');
const backup = require('./routes/backup');
const pssysjob = require('./routes/pssysjob');
const prpwdpol = require('./routes/prpwdpol');
const ddl = require("./routes/ddl");
const version = require('./routes/version');
const test = require('./routes/test');
const otp = require('./routes/otp');
const pos = require("./routes/pos");
const pssyspar = require('./routes/pssyspar');
const door = require("./routes/access");
const shooting = require("./routes/shooting_dummy");

// Misc Middleware
const logger = require('./common/logger');

const app = express();

// Apply Logger
app.use(logger);

// Set up Handlebars view engine
const hbs = exphbs.create({
    defaultLayout: false, // Set to false if you do not have a default layout
    helpers: {
        // You can add custom helpers here
    },
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

const allowedURL = process.env.CORS_URL.split(',');
app.use(cors({
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
    origin: allowedURL
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging
var accessLogStream = fs.createWriteStream(path.join(__dirname, '/logs/access.log'), { flags: 'a' })
morgan.token('date', function () {
    return moment().format("DD-MM-YYYY, h:mm:ss a");
});

app.use(morgan('[:date] :method :url :status :res[content-length] - :response-time ms', { stream: accessLogStream }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ------------- Passport Middleware -------------- //
app.use(passport.initialize());

// ---------- Passport Configuration --------------//
require('./config/passport')(passport);
// Use Routes
// Main Routes  
app.use('/api/prgencde', prgencde);
app.use('/api/prgentyp', prgentyp);
app.use('/api/prfuncde', prfuncde);
app.use('/api/psfappar', psfappar)
app.use('/api/prfunacs', prfunacs);
app.use('/api/pssysann', pssysann);
app.use('/api/psusrprf', psusrprf);
app.use('/api/psvchpar', psvchpar);
app.use('/api/pstrnscd', pstrnscd);
app.use('/api/dashboard', dashboard);
app.use('/api/pscrdpar', pscrdpar);
app.use('/api/pscampgn', pscampgn);
app.use('/api/pscament', pscament);
app.use('/api/mcmaster', mcmaster);
app.use('/api/psprdtyp', psprdtyp);
app.use('/api/psprdcat', psprdcat);
app.use('/api/mcmchpic', mcmchpic);
app.use('/api/psprdrsk', psprdrsk);
app.use('/api/psmbrprf', psmbrprf);
app.use('/api/mcmercat', mcmercat);
app.use('/api/pstiepar', pstiepar);
app.use('/api/psmbrtrx', psmbrtrx);
app.use('/api/psmbrvch', psmbrvch);
app.use('/api/psotppar', psotppar);
app.use('/api/pstiepri', pstiepri);
app.use('/api/psvchitm', psvchitm);
app.use('/api/psbnrimg', psbnrimg);
app.use('/api/psmbrprg', psmbrprg);
app.use('/api/pstblmas', pstblmas);
app.use('/api/psrompar', psrompar);
app.use('/api/psromjnp', psromjnp);
app.use('/api/psromimg', psromimg);
app.use('/api/psresvpf', psresvpf);
app.use('/api/pscncpar', pscncpar);
app.use('/api/psrbkpar', psrbkpar);
app.use('/api/psrstpar', psrstpar);
app.use('/api/psresvwl', psresvwl);
app.use('/api/psprdpar', psprdpar)
app.use('/api/application', application);
app.use('/api/psfacpar', psfacpar);
app.use('/api/psfcspar', psfcspar);
app.use('/api/pswalpar', pswalpar);
app.use('/api/psmbrwlt', psmbrwlt);
app.use('/api/sales', sales);
app.use('/api/pspympar', pspympar);
app.use('/api/psnotipf', psnotipf);
app.use('/api/psnotmda', psnotmda);
app.use('/api/psnotsgp', psnotsgp);
app.use('/api/psnotgrp', psnotgrp);
app.use('/api/psnotgrd', psnotgrd);
app.use('/api/pschnpar', pschnpar);
app.use('/api/pschnncp', pschnncp);
app.use('/api/pscmkpar', pscmkpar);
app.use('/api/pscmkrqt', pscmkrqt);
app.use('/api/pstrcpar', pstrcpar);
app.use('/api/prawrkgrp', prawrkgrp);
app.use('/api/pstrnsrm', pstrnsrm);
app.use('/api/payment', payment);
app.use('/api/prrpttmp', prrpttmp);
app.use('/api/psrsvuid', psrsvuid);
app.use('/api/pass', pass);
app.use('/api/pspaspar', pspaspar);

// MISC Routes
app.use('/api/document', document);
app.use('/api/report', report);
app.use('/api/ddl', ddl);
app.use('/api/backup', backup);
app.use('/api/pssysjob', pssysjob);
app.use('/api/prpwdpol', prpwdpol);
app.use('/api/mntlog', mntlog);
app.use('/api/version', version);
app.use('/api/test', test);
app.use('/api/otp', otp);
app.use('/api/pos', pos);
app.use('/api/pssyspar', pssyspar);
app.use('/api/access', door);
app.use('/api/shooting', shooting);


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
const backupJob = require("./cron/backup-job");
const dailyJob = require("./cron/daily-job");
const notificationJob = require("./cron/notification-job");

// -- Cron Execution -- //
// dailyJob.reset_daily_login();
// dailyJob.daily_checkin_reminder();
// dailyJob.reset_voucher_claim();
// dailyJob.tier_benefit();
// dailyJob.tier_check();
// dailyJob.voucher_expiry();
// dailyJob.daily_course_reminder();
// backupJob.backupDB();
// backupJob.cleanDB();
// backupJob.cleanFS();
// dailyJob.send_notifications();
// dailyJob.notify_expiry();
notificationJob.notify_pass_appointment();
notificationJob.notify_training_appointment();

// Socket
const port = process.env.PORT || 8080;

console.log('===Server Start===')
app.listen(port, () => console.log(new Date() + `\nServer running on Port ${port}`));
