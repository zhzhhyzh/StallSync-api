// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const pssysjob = db.pssysjob;

// Common Function
const Op = db.Sequelize.Op;
const returnSuccess = require('../common/success');
const common = require('../common/common');

exports.list = async (req, res) => {
    if (req.user.psusrtyp != 'ADM') return returnError(req, 500, "INVALIDAUTHORITY", res);

    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (!_.isEmpty(req.query.psjobcde)) {
        let dsc = await common.retrieveSpecificGenCodes(req,'JOBCDE', req.query.psjobcde);
        if (dsc && !_.isEmpty(dsc.prgedesc)) option.psjobcde = req.query.psjobcde;
    }
    if (!_.isEmpty(req.query.psjobsts)) {
        let dsc = await common.retrieveSpecificGenCodes(req,'JOBSTS', req.query.psjobsts);
        if (dsc && !_.isEmpty(dsc.prgedesc)) option.psjobsts = req.query.psjobsts;
    }
    if (!_.isEmpty(req.query.from)) {
        let start = new Date(req.query.from);
        start.setHours(0, 0, 0, 0);
        if (!_.isEmpty(req.query.to)) {
            let end = new Date(req.query.to);
            end.setHours(23, 59, 59, 999);
            option.psjobstd = {
                [Op.and]: [
                    { [Op.gte]: start },
                    { [Op.lte]: end }
                ]
            }
        }
    } else if (!_.isEmpty(req.query.to)) {
        let end = new Date(req.query.to);
        end.setHours(23, 59, 59, 999);
        option.psjobstd = {
            [Op.lte]: end
        }
    }

    const { count, rows } = await pssysjob.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        order: [['id', 'DESC']],
        where: option,
        raw: true
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        if (!_.isEmpty(obj.psjobcde)) {
            let desc1 = await common.retrieveSpecificGenCodes(req,'JOBCDE', obj.psjobcde);
            obj.psjobcdedsc = desc1 && !_.isEmpty(desc1.prgedesc) ? desc1.prgedesc : obj.psjobcde;
        }
        if (!_.isEmpty(obj.psjobsts)) {
            let desc2 = await common.retrieveSpecificGenCodes(req,'JOBSTS', obj.psjobsts);
            obj.psjobstsdsc = desc2 && !_.isEmpty(desc2.prgedesc) ? desc2.prgedesc : obj.psjobsts;
        }

        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: {} }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}