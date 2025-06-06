// Import
const db = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require("lodash");

// Table File
const prgentyp = db.prgentyp;
const prgencde = db.prgencde;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validateGencdeInput = require('../validation/gencde-validation');


exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.search) {
        option = {
            prgtycde: req.query.prgtycde,
            [Op.or]: [
                { prgecode: { [Op.like]: '%' + req.query.search + '%' } },
                { prgecode: req.query.search },
                { prgedesc: { [Op.like]: '%' + req.query.search + '%' } },
                { prgedesc: req.query.search }
            ]
        }
    } else {
        option = {
            prgtycde: req.query.prgtycde,
            prgecode: { [Op.like]: '%%' }
        }
    }

    const { count, rows } = await prgencde.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['prgecode', 'ASC']],
        raw: true
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        let description = await prgentyp.findOne({
            where: {
                prgtycde: obj.prgtycde
            }, raw: true
        });
        if (description && !_.isEmpty(description.prgtydsc)) obj.prgtycdedsc = description.prgtydsc;
        else obj.prgtycdedsc = obj.prgtycde;

        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'prgencde', key: ['prgtycde', 'prgecode'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.findOne = async (req, res) => {
    if (!req.query.prgtycde) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    if (!req.query.prgecode) return returnError(req, 400, "RECORDIDISREQUIRED", res);
    else {
        prgencde.findOne({
            where: {
                prgtycde: req.query.prgtycde,
                prgecode: req.query.prgecode
            }, raw: true
        }).then(async gencde => {
            if (gencde) {
                let gentyp = await prgentyp.findOne({
                    where: {
                        prgtycde: gencde.prgtycde
                    }, raw: true
                });

                if (gentyp && gentyp.prgtydsc) gencde.prgtycded = gentyp.prgtydsc;
                else gencde.prgtycded = '';

                if (gentyp) return returnSuccess(200, { gencde: gencde }, res);
                else return returnError(req, 500, "NORECORDFOUND", res);
            } else return returnError(req, 500, "NORECORDFOUND", res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = (req, res) => {
    //Validation
    const { errors, isValid } = validateGencdeInput(req.body, 'A');
    if (!isValid) return returnError(req, 400, errors, res);

    prgentyp.findOne({
        where: {
            prgtycde: req.body.prgtycde
        }, raw: true
    }).then(gentyp => {
        if (gentyp) {
            if (req.body.prgecode.length > gentyp.prgtylen) return returnError(req, 400, { prgecode: "INVALIDVALUELENGTH&" + gentyp.prgtylen }, res);

            prgencde.findOne({
                where: {
                    prgtycde: gentyp.prgtycde,
                    prgecode: req.body.prgecode
                }, raw: true
            }).then(gencde => {
                if (gencde) return returnError(req, 400, { prgecode: "RECORDEXISTS" }, res);
                else {
                    const new_gencde = {
                        prgtycde: gentyp.prgtycde,
                        prgecode: req.body.prgecode,
                        prgedesc: req.body.prgedesc,
                        prgeldes: req.body.prgeldes,
                        crtuser: req.user.psusrunm
                    }

                    prgencde.create(new_gencde).then(data => {
                        let created = data.get({ plain: true });
                        common.writeMntLog('prgencde', null, null, created.prgtycde + '-' + created.prgecode, 'A', req.user.psusrunm);
                        return returnSuccessMessage(req, 200, "RECORDCREATED", res);
                    }).catch(err => {
                        console.log(err);
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });
                }
            });
        } else return returnError(req, 500, "UNEXPECTEDERROR", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
}

exports.update = async (req, res) => {
    //Validation
    const { errors, isValid } = validateGencdeInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    const prgtycde = req.body.prgtycde;
    const prgecode = req.body.prgecode;

    await prgencde.findOne({
        where: {
            prgtycde: prgtycde,
            prgecode: prgecode
        }, raw: true, attributes: { exclude: ['mntuser', 'updatedAt', 'createdAt'] }
    }).then(gencde => {
        if (gencde) {
            req.body.mntuser = req.user.psusrunm;

            const new_gencde = {
                prgedesc: req.body.prgedesc,
                prgeldes: req.body.prgeldes,
                mntuser: req.user.psusrunm
            }

            prgencde.update(new_gencde,
                {
                    where: {
                        id: gencde.id
                    }, returning: true, plain: true
                }).then(async () => {
                    common.writeMntLog('prgencde', gencde, await prgencde.findByPk(gencde.id, { raw: true }), gencde.prgtycde + '-' + gencde.prgecode, 'C', req.user.psusrunm);
                    return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                }).catch(err => {
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
        } else return returnError(req, 500, "NORECORDFOUND", res);
    });
}

exports.delete = (req, res) => {
    const prgtycde = req.body.prgtycde;
    const prgecode = req.body.prgecode;

    if (!prgtycde) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    if (!prgecode) return returnError(req, 500, "RECORDIDISREQUIRED", res);

    prgencde.findOne({
        where: {
            prgtycde: prgtycde,
            prgecode: prgecode
        }, raw: true
    }).then(gencde => {
        if (gencde) {
            prgencde.destroy({
                where: { id: gencde.id }
            }).then(() => {
                common.writeMntLog('prgencde', null, null, gencde.prgtycde + '-' + gencde.prgecode, 'D', req.user.psusrunm);
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