const express = require('express');
const router = express.Router();
const exec = require('child_process').exec;
const db = require("../models");
const Op = db.Sequelize.Op;
const _ = require("lodash");
const fs = require("fs");
const path = require('path');
// Constant
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const constant = require("../constant/generalConfig");

// Common Functions
const returnSuccess = require("../common/success");
const returnSuccessMessage = require('../common/successMessage');
const returnError = require('../common/error');
const authenticateRoute = require('../common/authenticate');
const common = require("../common/common.js");

// Models
const backup = db.backup;

// @route   GET api/backup/backup
// @desc    Backup Database
// @access  Private
router.post("/backup", authenticateRoute, async (req, res) => {
    const backupDir = path.resolve(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    let start = new Date();
    const filename = `stallsync-${start.getFullYear() + _.padStart((start.getMonth() + 1), 2, 0) + start.getDate() + '-' + _.padStart(start.getHours(), 2, '0') + _.padStart(start.getMinutes(), 2, '0') + _.padStart(start.getSeconds(), 2, '0')}`;
    const command = " mysqldump --user=" + config.username + " --password=" + config.password + " --host=localhost --routines --events --triggers --single-transaction --no-tablespaces " + config.database + " | openssl smime -encrypt -binary -text -aes256 -out .//backups//" + filename + ".sql.enc -outform DER .//config//mysqldump-cert.pem";
    exec(command, async function (error, stdout, stderr) {
        console.log(stderr);
        if (error) {
            console.log(error);
            await backup.create({
                filename: filename + ".sql.enc",
                mode: "MANU",
                status: "FAL",
                user: req.user.psusrunm
            }).catch(err => console.log(err));
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
        await backup.create({
            filename: filename + ".sql.enc",
            mode: "MANU",
            user: req.user.psusrunm
        }).catch(err => {
            console.log("Backup Failed");
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });

        // Check If need to remove file
        let dir = "./backups";
        let max_file = await common.retrieveSpecificGenCodes(req, 'BACKUP', 'DAY');
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

        return returnSuccessMessage(req, 200, "BACKUPSUCCESS", res);
    });
});

// @route   GET api/backup/list
// @desc    List Backup database History
// @access  Private
router.get("/list", authenticateRoute, async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {}
    if (!_.isEmpty(req.query.filename)) {
        option.filename = {
            [Op.or]: [
                { [Op.eq]: req.query.filename },
                { [Op.like]: '%' + req.query.filename + '%' }
            ]
        }
    }

    if (!_.isEmpty(req.query.mode)) {
        let desc = await common.retrieveSpecificGenCodes(req, 'BCKMODE', req.query.mode)
        if (desc && !_.isEmpty(desc.prgedesc))
            option.mode = req.query.mode;
    }

    if (!_.isEmpty(req.query.from)) {
        let from = new Date(req.query.from);
        from.setHours(0, 0, 0, 0);
        if (!_.isEmpty(req.query.to)) {
            let to = new Date(req.query.to);
            to.setHours(23, 59, 59, 999);

            option.createdAt = {
                [Op.and]: [
                    { [Op.gte]: from },
                    { [Op.lte]: to }
                ]
            }
        } else {
            option.createdAt = {
                [Op.gte]: from
            }
        }
    } else if (!_.isEmpty(req.query.to)) {
        let to = new Date(req.query.to);
        to.setHours(23, 59, 59, 999);

        option.createdAt = {
            [Op.lte]: to
        }
    }

    const { count, rows } = await backup.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['id', 'DESC']],
        raw: true
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        let desc1 = await common.retrieveSpecificGenCodes(req, 'BCKMODE', obj.mode);
        let desc2 = await common.retrieveSpecificGenCodes(req, 'BCKSTS', obj.status);
        obj.modedsc = desc1 && !_.isEmpty(desc1.prgedesc) ? desc1.prgedesc : obj.mode;
        obj.statusdsc = desc2 && !_.isEmpty(desc2.prgedesc) ? desc2.prgedesc : obj.status;

        if (!_.isEmpty('' + obj.createdAt)) {
            obj.createdAt = await common.formatDate(obj.createdAt, "/");
        }

        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: {} }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
});

router.get('/download', authenticateRoute, async (req, res) => {
    let filename = req.query.filename ? req.query.filename : '';
    if (_.isEmpty(filename)) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    let backup_file = await backup.findOne({
        where: {
            filename: filename
        }, raw: true
    });
    if (backup_file) {

        await backup.update({
            status: "DOW"
        }, {
            where: {
                id: backup_file.id
            }
        }).then(() => {

            let outputpath = constant.backupPath + filename;
            let file = fs.existsSync(outputpath);
            if (file) {
                res.download(outputpath);
            } else return returnError(req, 500, "UNEXPECTEDERROR", res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR"), res
        });
    } else return returnError(req, 500, "NORECORDFOUND", res);

});

module.exports = router;