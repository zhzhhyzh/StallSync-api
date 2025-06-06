// Import
const db = require("../models");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require("lodash");

// Table File
const prgentyp = db.prgentyp;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validateGentypInput = require('../validation/gentyp-validation');

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (!_.isEmpty(req.query.search)) {
        option = {
            [Op.or]: [
                { prgtycde: { [Op.like]: '%' + req.query.search + '%' } },
                { prgtycde: req.query.search },
                { prgtydsc: { [Op.like]: '%' + req.query.search + '%' } },
                { prgtydsc: req.query.search }
            ]
        }
    }

    if (!_.isEmpty(req.query.type)) {
        option.prgtycat = req.query.type;
    }

    const { count, rows } = await prgentyp.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        order: [['prgtycde', 'ASC']],
        where: option,
        raw: true, attributes: [['prgtycde', 'id'], 'prgtycde', 'prgtydsc', 'prgtylds', 'prgtylen', 'prgtyman', 'prgtycat']
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        if (!_.isEmpty(obj.prgtyman)) {
            let gtyman = await common.retrieveSpecificGenCodes(req, 'GTMAND', obj.prgtyman);
            obj.prgtymandsc = gtyman.prgedesc ? gtyman.prgedesc : '';
        }
        if (!_.isEmpty(obj.prgtycat)) {
            let gtycat = await common.retrieveSpecificGenCodes(req, 'GTCAT', obj.prgtycat);
            obj.prgtycatdsc = gtycat.prgedesc ? gtycat.prgedesc : '';
        }
        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'prgentyp', key: ['prgtycde'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.findOne = async (req, res) => {
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        await prgentyp.findOne({
            where: {
                prgtycde: req.query.id
            }, raw: true
        }).then(async gentyp => {
            if (gentyp) {
                if (!_.isEmpty(gentyp.prgtyman)) {
                    let gtyman = await common.retrieveSpecificGenCodes(req, 'GTMAND', gentyp.prgtyman);
                    gentyp.prgtymandsc = gtyman.prgedesc ? gtyman.prgedesc : '';
                }
                if (!_.isEmpty(gentyp.prgtycat)) {
                    let gtycat = await common.retrieveSpecificGenCodes(req, 'GTCAT', gentyp.prgtycat);
                    gentyp.prgtycatdsc = gtycat.prgedesc ? gtycat.prgedesc : '';
                }

                return returnSuccess(200, gentyp, res);
            } else return returnError(req, 500, 'NORECORDFOUND', res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = (req, res) => {
    //Validation
    const { errors, isValid } = validateGentypInput(req.body, 'A');
    if (!isValid) return returnError(req, 400, errors, res);

    prgentyp.findOne({
        where: {
            prgtycde: req.body.prgtycde
        }, raw: true
    }).then(gentyp => {
        if (gentyp) return returnError(req, 400, { prgtycde: "RECORDEXISTS" }, res);
        else {
            const new_gentyp = {
                prgtycde: req.body.prgtycde,
                prgtydsc: req.body.prgtydsc,
                prgtylds: req.body.prgtylds,
                prgtylen: req.body.prgtylen,
                prgtyman: req.body.prgtyman,
                prgtycat: req.body.prgtycat,
                crtuser: req.user.psusrunm
            }

            prgentyp.create(new_gentyp).then(data => {
                let created = data.get({ plain: true });
                common.writeMntLog('prgentyp', null, null, created.prgtycde, 'A', req.user.psusrunm);
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
    const { errors, isValid } = validateGentypInput(req.body, 'C');
    if (!isValid) return returnError(req, 400, errors, res);

    const prgtycde = req.body.prgtycde;

    await prgentyp.findOne({
        where: {
            prgtycde: prgtycde
        }, raw: true, attributes: { exclude: ['mntuser', 'updatedAt', 'createdAt'] }
    }).then(gentyp => {
        if (gentyp) {
            if (req.body.prgtycde && req.body.prgtycde != gentyp.prgtycde) return returnError(req, 400, { prgtycde: 'GTYCDECANTBECHANGE' }, res);

            const new_gentyp = {
                prgtydsc: req.body.prgtydsc,
                prgtylds: req.body.prgtylds,
                prgtylen: req.body.prgtylen,
                prgtyman: req.body.prgtyman,
                prgtycat: req.body.prgtycat,
                mntuser: req.user.psusrunm
            }

            prgentyp.update(new_gentyp,
                {
                    where: {
                        id: gentyp.id
                    }
                }).then(async () => {
                    common.writeMntLog('prgentyp', gentyp, await prgentyp.findByPk(gentyp.id, { raw: true }), gentyp.prgtycde, 'C', req.user.psusrunm);
                    return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                }).catch(err => {
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
        } else {
            return returnError(req, 500, "NORECORDFOUND", res);
        }
    });
}

exports.delete = (req, res) => {
    const prgtycde = req.body.prgtycde;
    if (!prgtycde) return returnError(req, 400, { prgtycde: "GENTYPCDISREQUIRED" }, res);
    prgentyp.findOne({
        where: {
            prgtycde: prgtycde
        }, raw: true
    }).then(gentyp => {
        if (gentyp) {
            prgentyp.destroy({
                where: { id: gentyp.id }
            }).then(() => {
                common.writeMntLog('prgentyp', null, null, gentyp.prgtycde, 'D', req.user.psusrunm);
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