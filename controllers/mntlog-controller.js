// Import
const db = require("../models");
const Op = db.Sequelize.Op;

// Table File
const mntlogpf = db.mntlogpf;
const pstblmas = db.pstblmas;
const pstblkey = db.pstblkey;
// Common Function
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const common = require("../common/common");

// Constant Messages
const fieldNames = require('../constant/fieldNames');

exports.findOne = async (req, res) => {
    const id = req.query.id;

    mntlogpf.findByPk(id, { raw: true }).then(data => {
        if (data)
            return returnSuccess(200, data, res);
        else
            return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);
    const { count, rows } = await mntlogpf.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: {
            'prmntfile': req.query.file,
            'prmntkey': req.query.key
        },
        raw: true, order: [['createdAt', 'desc'], ['id', 'desc']]
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        if (fieldNames[obj.prfieldnme]) {
            obj.prfieldnme = fieldNames[obj.prfieldnme];
            let tempField = obj.prfieldnme.toLowerCase();
            if (tempField.indexOf("date time") > 0) {
                try {
                    obj.prfldolddta = await common.formatDateTime(obj.prfldolddta, "24");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDateTime(obj.prfldnewdta, "24");
                } catch (err) { }
            }
            else if (obj.prfieldnme.indexOf("date") > 0 || obj.prfieldnme.indexOf("Date") > 0) {
                try {
                    obj.prfldolddta = await common.formatDate(obj.prfldolddta, "-");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDate(obj.prfldnewdta, "-");
                } catch (err) { }
            }
            else if (obj.prfieldnme.indexOf("time") > 0 || obj.prfieldnme.indexOf("Time") > 0) {
                try {
                    obj.prfldolddta = await common.formatDateTime(obj.prfldolddta, "24");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDateTime(obj.prfldnewdta, "24");
                } catch (err) { }
            }
            if (obj.prfldolddta == 'null') obj.prfldolddta = '';
        }

        obj.createdAt = await common.formatDateTime(obj.createdAt, "24");
        obj.updatedAt = await common.formatDateTime(obj.updatedAt, "24");

        newRows.push(obj);
    }

    // Find Sub Files
    let tblmas = await pstblmas.findAll({
        where: {
            pstblpnt: req.query.file
        }, raw: true
    });

    let sub_files = [];
    for (var i = 0; i < tblmas.length; i++) {
        let sub_file = tblmas[i];
        sub_files.push({
            file: sub_file.pstblnme,
            description: sub_file.pstbldsc
        });
    }

    let mainFile = await pstblmas.findOne({
        where: {
            pstblnme: req.query.file
        }, raw: true
    });

    let key_list = [];
    if (mainFile) {
        let keys = await pstblkey.findAll({
            where: {
                pstblnme: req.query.file
            }, raw: true, order: [['pstblkys', 'asc']]
        });

        let incoming_key = req.query.key.split("-");
        for (var i = 0; i < keys.length; i++) {
            let ky = keys[i];
            key_list.push({
                name: fieldNames[ky.pstblkyn] ? fieldNames[ky.pstblkyn] : "",
                value: incoming_key.length >= i ? incoming_key[i] : ""
            });
        }
    }
    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { sub_files: sub_files, key_list, main_file: mainFile ? { file: mainFile.pstblnme, description: mainFile.pstbldsc } : {} } }, res);
    else return returnSuccess(200, { total: 0, data: [], extra: { sub_files: sub_files, key_list, main_file: mainFile ? { file: mainFile.pstblnme, description: mainFile.pstbldsc } : {} } }, res);
}

exports.sub_list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    const { count, rows } = await mntlogpf.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: {
            'prmntfile': req.query.file,
            'prmntkey': {
                [Op.like]: req.query.key + '-' + '%'
            }
        },
        raw: true, order: [['createdAt', 'desc'], ['id', 'desc']]
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        if (fieldNames[obj.prfieldnme]) {
            obj.prfieldnme = fieldNames[obj.prfieldnme];
            let tempField = obj.prfieldnme.toLowerCase();
            if (tempField.indexOf("date time") > 0) {
                try {
                    obj.prfldolddta = await common.formatDateTime(obj.prfldolddta, "24");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDateTime(obj.prfldnewdta, "24");
                } catch (err) { }
            }
            else if (obj.prfieldnme.indexOf("date") > 0 || obj.prfieldnme.indexOf("Date") > 0) {
                try {
                    obj.prfldolddta = await common.formatDate(obj.prfldolddta, "-");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDate(obj.prfldnewdta, "-");
                } catch (err) { }
            }
            else if (obj.prfieldnme.indexOf("time") > 0 || obj.prfieldnme.indexOf("Time") > 0) {
                try {
                    obj.prfldolddta = await common.formatDateTime(obj.prfldolddta, "24");
                } catch (err) { }
                try {
                    obj.prfldnewdta = await common.formatDateTime(obj.prfldnewdta, "24");
                } catch (err) { }
            }
            if (obj.prfldolddta == 'null') obj.prfldolddta = '';
        }

        obj.createdAt = await common.formatDateTime(obj.createdAt, "24");
        obj.updatedAt = await common.formatDateTime(obj.updatedAt, "24");

        newRows.push(obj);
    }

    let mainFile = await pstblmas.findOne({
        where: {
            pstblnme: req.query.file
        }, raw: true
    });

    let key_list = [];
    if (mainFile) {
        let keys = await pstblkey.findAll({
            where: {
                pstblnme: req.query.file
            }, raw: true, order: [['pstblkys', 'asc']]
        });

        let incoming_key = req.query.key.split("-");
        for (var i = 0; i < keys.length; i++) {
            let ky = keys[i];
            key_list.push({
                name: fieldNames[ky.pstblkyn] ? fieldNames[ky.pstblkyn] : "",
                value: incoming_key.length >= i ? incoming_key[i] : ""
            });
        }
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { key_list, main_file: mainFile ? { file: mainFile.pstblnme, description: mainFile.pstbldsc } : {} } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

