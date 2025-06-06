// Import
const db = require("../models");
const _ = require('lodash');

// Table File
const prpwdpol = db.prpwdpol;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validatePwdpolInput = require('../validation/pwdpol-validation');

// exports.list = async (req, res) => {
//     let limit = 10;
//     if (req.query.limit) limit = req.query.limit;

//     let from = 0;
//     if (!req.query.page) from = 0;
//     else from = parseInt(req.query.page) * parseInt(limit);

//     let option = {};
//     if (req.query.prpolcde) {
//         option = {
//             [Op.or]: [
//                 { prpolcde: { [Op.like]: req.query.prpolcde + '%' } },
//                 { prpolcde: req.query.prpolcde }
//             ]
//         }
//         from = 0;
//     } else {
//         option = {
//             prpolcde: { [Op.like]: '%%' }
//         }
//     }

//     const { count, rows } = await prpwdpol.findAndCountAll({
//         limit: parseInt(limit),
//         offset: from,
//         where: option,
//         raw: true, attributes: [['prpolcde', 'id'], 'prpolcde', 'prpoltyp', 'prpoldes', 'prpoldta', 'prpolmsg' , 'prpolsts']
//     });

//     let newRows = [];
//     for (var i = 0; i < rows.length; i++) {
//         let obj = rows[i];

//         if (!_.isEmpty(obj.prpoltyp)) {
//             let poltyp = await common.retrieveSpecificGenCodes(req,'POLTYP', obj.prpoltyp);
//             obj.prpoltypdsc = poltyp.prgedesc ? poltyp.prgedesc : ''
//         }
//         newRows.push(obj);
//     }
//     if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'prpwdpol', key: ['prpolcde'] } }, res);
//     else return returnSuccess(200, { total: 0, data: [] }, res);
// }

exports.findOne = async (req, res) => {
    prpwdpol.findOne({
        where: {
            id: 1
        }, raw: true
    }).then(async poltyp => {
        if (!poltyp) return returnError(req, 500, 'NORECORDFOUND', res);
        else {
            // let data = await common.retrieveSpecificGenCodes(req,'POLTYP', poltyp.prpoltyp);
            // poltyp.prpoltypdsc = data.prgedesc ? data.prgedesc : ''
            return returnSuccess(200, poltyp, res);
        }
    });
}

// exports.create = (req, res) => {
//     // Validation
//     const { errors, isValid } = validatePwdpolInput(req.body, 'A');
//     if (!isValid) return returnError(req, 400, errors, res);

//     prpwdpol.findOne({
//         where: {
//             prpolcde: req.body.prpolcde
//         }, raw: true
//     }).then(pwdpol => {
//         if (pwdpol) return returnError(req, 400, { prgtycde: "RECORDEXISTED" }, res);
//         else {
//             prpwdpol.create(req.body).then(data => {
//                 let created = data.get({ plain: true });
//                 common.writeMntLog('prpwdpol', null, null, created.prpolcde, 'A', req.user.psusrunm);
//                 return returnSuccessMessage(req, 200, "RECORDCREATED", res);
//             }).catch(err => {
//                 console.log(err);
//                 return returnError(req, 500, "UNEXPECTEDERROR", res);
//             });
//         }
//     }).catch(err => {
//         console.log(err);
//         return returnError(req, 500, "UNEXPECTEDERROR", res);
//     });
// }

exports.update = async (req, res) => {
    // Validation
    const { errors, isValid } = validatePwdpolInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    let pwdpol = await prpwdpol.findOne({
        where: {
            id: 1
        }, raw: true, attributes: {
            exclude: ['createdAt', 'updatedAt', 'prcrtusr', 'prmntusr']
        }
    });
    if (!pwdpol) return returnError(req, 500, "NORECORDFOUND", res);
    else {
        let check = await common.compareObject(req.body, pwdpol);
        if (!check) {
            req.body.prmntusr = req.user.psusrunm;
            await prpwdpol.update(req.body, {
                where: {
                    id: pwdpol.id
                }
            });
            common.writeMntLog('prpwdpol', pwdpol, await prpwdpol.findByPk(pwdpol.id, { raw: true }), pwdpol.id, 'C', req.user.psusrunm);
        }
        return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
    }
}

// exports.delete = (req, res) => {
//     const id = req.body.id;
//     // Validation
//     if (!id) return returnError(req, 400, { id: "RECORDIDISREQUIRED" }, res);

//     prpwdpol.findOne({
//         where: {
//             prpolcde: id
//         }, raw: true
//     }).then(pwdpol => {
//         if (pwdpol) {
//             prpwdpol.destroy({
//                 where: { id: pwdpol.id }
//             }).then(() => {
//                 common.writeMntLog('prpwdpol', null, null, pwdpol.prpolcde, 'D', req.user.psusrunm);
//                 return returnSuccessMessage(req, 200, "RECORDDELETED", res);
//             }).catch(err => {
//                 return returnError(req, 500, "UNEXPECTEDERROR", res);
//             })
//         } else return returnError(req, 400, { id: "POLICYNOTFOUND" }, res);
//     });
// }