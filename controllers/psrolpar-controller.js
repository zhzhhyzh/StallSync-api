// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const psrolpar = db.psrolpar;
// const pstblkey = db.pstblkey;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const fieldNames = require("../constant/fieldNames");
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validatePsrolparInput = require('../validation/psrolpar-validation');

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.search || !_.isEmpty(req.query.search)) {
        option = {
            [Op.or]: [
                { psrolcde: { [Op.eq]: req.query.search } },
                { psrolcde: { [Op.like]: '%' + req.query.search + '%' } },
                { psroldsc: { [Op.eq]: req.query.search } },
                { psroldsc: { [Op.like]: '%' + req.query.search + '%' } },
            ]
        }
    }

    // if (req.query.psrolibi && !_.isEmpty(req.query.psrolibi)) option.psrolibi = req.query.psrolibi;
    // if (req.query.psrolibm && !_.isEmpty(req.query.psrolibm)) option.psrolibm = req.query.psrolibm;


    const { count, rows } = await psrolpar.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['psrolcde', 'ASC']],
        raw: true,
        attributes: [['psrolcde', 'id'], 'psrolcde', 'psrolibi', 'psroldsc', 'psrolibm']
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        // if (!_.isEmpty(obj.psrolibi)) {
        //     let tbltyp = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', obj.psrolibi);
        //     obj.psrolibidsc = tbltyp.prgedesc ? tbltyp.prgedesc : '';
        // }

        // if (!_.isEmpty(obj.psrolibm)) {
        //     let tbltyp = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', obj.psrolibm);
        //     obj.psrolibmdsc = tbltyp.prgedesc ? tbltyp.prgedesc : '';
        // }


        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'psrolpar', key: ['psrolcde'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.findOne = async (req, res) => {
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        await psrolpar.findOne({
            where: {
                psrolcde: req.query.id
            }, raw: true
        }).then(async found => {
            if (found) {
                return returnSuccess(200, found, res);
            } else return returnError(req, 500, 'NORECORDFOUND', res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = async (req, res) => {
    //Validation
    const { errors, isValid } = validatePsrolparInput(req.body, 'A');
    if (!isValid) return returnError(req, 400, errors, res);

    // const description1 = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', req.body.psrolibi);
    // if (!description1 || _.isEmpty(description1.prgedesc)) {
    //     return returnError(req, 400, { psrolibi: "INVALIDDATAVALUE" }, res);
    // }


    // const description2 = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', req.body.psrolibm);
    // if (!description2 || _.isEmpty(description2.prgedesc)) {
    //     return returnError(req, 400, { psrolibm: "INVALIDDATAVALUE" }, res);
    // }

    psrolpar.findOne({
        where: {
            psrolcde: req.body.psrolcde
        }, raw: true
    }).then(found => {
        if (found) return returnError(req, 400, { psrolcde: "RECORDEXISTS" }, res);
        else {
            const new_found = {
                psrolcde: req.body.psrolcde,
                psroldsc: req.body.psroldsc,
                psrollds: req.body.psrollds,
                // psrolibm: req.body.psrolibm,
                // psrolibi: req.body.psrolibi,
                crtuser: req.user.psusrunm,
                mntuser: req.user.psusrunm
            }

            psrolpar.create(new_found).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('psrolpar', null, null, created.psrolcde, 'A', req.user.psusrunm, "Role Code", created.psrolcde);
                return returnSuccessMessage(req, 200, "RECORDCREATED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        }
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.update = async (req, res) => {
    //Validation
    const { errors, isValid } = validatePsrolparInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    // const description1 = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', req.body.psrolibi);
    // if (!description1 || _.isEmpty(description1.prgedesc)) {
    //     return returnError(req, 400, { psrolibi: "INVALIDDATAVALUE" }, res);
    // }

    // const description2 = await common.retrieveSpecificGenCodes(req, 'DATAACCESS', req.body.psrolibm);
    // if (!description2 || _.isEmpty(description2.prgedesc)) {
    //     return returnError(req, 400, { psrolibm: "INVALIDDATAVALUE" }, res);
    // }

    await psrolpar.findOne({
        where: {
            psrolcde: req.body.psrolcde
        }, raw: true, attributes: { exclude: ['mntuser', 'createdAt'] }
    }).then(found => {
        if (found) {
            if (isNaN(new Date(req.body.updatedAt)) || (new Date(found.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

            // if (req.body.psrolcde && req.body.psrolcde != found.psrolcde) return returnError(req, 400, { psrolcde: 'NORECORDFOUND' }, res);

            const new_found = {
                psroldsc: req.body.psroldsc,
                psrollds: req.body.psrollds,
                // psrolibm: req.body.psrolibm,
                // psrolibi: req.body.psrolibi,
                mntuser: req.user.psusrunm
            }

            psrolpar.update(new_found,
                {
                    where: {
                        id: found.id
                    }
                }).then(async () => {
                    common.writeMntLog('psrolpar', found, await psrolpar.findByPk(found.id, { raw: true }), found.psrolcde, 'C', req.user.psusrunm,"Role Code", found.psrolcde);
                    return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                }).catch(err => {
                    console.log(err);
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
        } else {
            return returnError(req, 500, "NORECORDFOUND", res);
        }
    });
}

exports.delete = (req, res) => {
    const id = req.body.id;
    if (!id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    psrolpar.findOne({
        where: {
            psrolcde: id
        }, raw: true
    }).then(found => {
        if (found) {
            psrolpar.destroy({
                where: { id: found.id }
            }).then(() => {
                common.writeMntLog('psrolpar', null, null, found.psrolcde, 'D', req.user.psusrunm, "Role Code", found.psrolcde,);
                return returnSuccessMessage(req, 200, "RECORDDELETED", res);
            }).catch(err => {
                console.log(err);
                return returnError(req, 500, "UNEXPECTEDERROR", res);
            });
        } else return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}
