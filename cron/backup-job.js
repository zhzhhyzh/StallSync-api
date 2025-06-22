const cron = require("node-cron");
const exec = require('child_process').exec;
const _ = require("lodash");
const fs = require("fs");

const db = require("../models");
const pssysjob = db.pssysjob;
const backup = db.backup;
const pslogpar = db.pslogpar;

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const genConfig = require("../constant/generalConfig");

async function backupDB() {
    cron.schedule('0 0 * * *', function () {
        let start = new Date();
        let filename = `stallsync-${start.getFullYear() + _.padStart((start.getMonth() + 1), 2, 0) + start.getDate() + '-' + _.padStart(start.getHours(), 2, '0') + _.padStart(start.getMinutes(), 2, '0') + _.padStart(start.getSeconds(), 2, '0')}`;
        try {
            console.log("Executing Backup Job");
            const command = " mysqldump --user=" + config.username + " --password=" + config.password + " --host=localhost --routines --events --triggers --single-transaction --no-tablespaces " + config.database + " | openssl smime -encrypt -binary -text -aes256 -out .//backups//" + filename + ".sql.enc -outform DER .//config//mysqldump-cert.pem";

            exec(command, async function (error, stdout, stderr) {
                let end = new Date();
                if (error) {
                    console.log(error);
                    // Create Error Job History
                    pssysjob.create({
                        psjobcde: "BACK",
                        psjobsts: "ERR",
                        psjobmsg: error,
                        psjobstd: start,
                        psjobend: end
                    });
                }
                // Create Success Job History
                pssysjob.create({
                    psjobcde: "BACK",
                    psjobsts: "CMP",
                    psjobmsg: "",
                    psjobstd: start,
                    psjobend: end
                });
                backup.create({
                    filename: filename + ".sql.enc",
                    mode: "AUTO"
                });

                // Check If need to remove file
                let dir = "./backups";
                let max_file = await common.retrieveSpecificGenCodes('BACKUP', 'DAY');
                if (!max_file && _.isEmpty(max_file.prgedesc) && !isNaN(parseInt(max_file.prgedesc))) max_file = 7;
                else max_file = parseInt(max_file.prgedesc);

                let files_before = [];
                let files_after = [];
                files_before = fs.readdirSync(dir);
                files_before = files_before.map((fileName) => {
                    return {
                        name: fileName,
                        time: fs.statSync(dir + "/" + fileName).birthtime.getTime()
                    };
                }).sort(function (a, b) {
                    return b.time - a.time;
                }).map(function (file) {
                    return file.name;
                });

                if (files_before.length > 7) {
                    for (var i = 7; i < files_before.length; i++) {
                        if (fs.existsSync(dir + "/" + files_before[i])) fs.unlinkSync(dir + "/" + files_before[i]);
                    }
                }
                files_after = fs.readdirSync(dir);
            });
        } catch (err) {
            console.log(err);
            pssysjob.create({
                psjobcde: "BACK",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: end
            });
            backup.create({
                filename: filename + ".sql.enc",
                mode: "AUTO",
                status: "FAL"
            });
        }
    });
}

async function cleanDB() {
    cron.schedule('15 0 * * *', async function () {
        let start = new Date();
        console.log("Executing Clean Backup File Job");

        try {
            // Find Last 7
            let last_7 = await backup.findAll({
                order: [['id', 'desc']], limit: 7
            });
            if (last_7.length > 7) {
                // Update Old Data Status
                await backup.update({
                    status: "REM"
                }, {
                    where: {
                        id: {
                            [Op.gt]: last_7[6].id
                        }
                    }
                });

                // Create Success Job History
                pssysjob.create({
                    psjobcde: "CLEANDB",
                    psjobsts: "CMP",
                    psjobmsg: "",
                    psjobstd: start,
                    psjobend: new Date()
                });
                console.log("Completed Clean Backup File Job");
            }
        } catch (err) {
            console.log(err);
            pssysjob.create({
                psjobcde: "BACK",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}

async function cleanFS() {
    cron.schedule('0 0 * * *', async function () {
        let start = new Date();
        console.log("Executing Clean File Structure Job (Temp Image)");
        try {
            const dir = genConfig.documentTempPath;
            if (fs.existsSync(dir)) {
                console.log("Directory Exist -- Listing Files");
                let current_dir_files = fs.readdirSync(dir);
                console.log(current_dir_files);
                for (var i = 0; i < current_dir_files.length; i++) {
                    console.log("Removing File -- " + current_dir_files[i]);
                    if (fs.existsSync(dir + "/" + current_dir_files[i])) fs.unlinkSync(dir + "/" + current_dir_files[i]);
                }
            }

            // Create Success Job History
            pssysjob.create({
                psjobcde: "CLEANFILE",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
            console.log("Completed Clean File Structure Job (Temp Image)");
        } catch (err) {
            console.log(err);
            pssysjob.create({
                psjobcde: "CLEANFILE",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}

async function swingLog() {
    cron.schedule('0 0 * * *', async function () {
        let start = new Date();
        console.log("Executing Swing Log File Job -- Start");
        try {
            let logs = await pslogpar.findAll({
                raw: true
            });
            for (var i = 0; i < logs.length; i++) {
                let dir = logs[i].pslogpth + logs[i].pslogfnm;
                if (fs.existsSync(dir + ".log")) {
                    fs.copyFileSync(dir + ".log", dir + "-" + await formatDate(new Date(), "_") + ".log");
                    fs.unlinkSync(dir) + ".log";
                    fs.writeFileSync(dir + ".log", "");
                } else fs.writeFileSync(dir + ".log", "");
            }

            // Create Success Job History
            pssysjob.create({
                psjobcde: "SWINGLOG",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
            console.log("Executing Swing Log File Job -- End");
        } catch (err) {
            console.log("Executing Swing Log File Job -- Error", err);
            pssysjob.create({
                psjobcde: "SWINGLOG",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}

module.exports = {
    backupDB: backupDB,
    cleanDB: cleanDB,
    cleanFS: cleanFS,
    swingLog: swingLog
}