// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const pswdypar = db.pswdypar;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validatePswdypar = require('../validation/pswdypar-validation');

exports.list = async (req, res) => {
    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.search && !_.isEmpty(req.query.search)) {
        option = {
            [Op.or]: [
                { pswdycde: { [Op.eq]: req.query.search } },
                { pswdycde: { [Op.like]: '%' + req.query.search + '%' } },
                { pswdydsc: { [Op.eq]: req.query.search } },
                { pswdydsc: { [Op.like]: '%' + req.query.search + '%' } }
            ]
        }
    }

    if (req.query.pswdyind && !_.isEmpty(req.query.pswdyind))
        option.pswdyind = req.query.pswdyind;


    const { count, rows } = await pswdypar.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        order: [['id', 'ASC']],
        raw: true,
        attributes: [ 'id', 'pswdycde', 'pswdydsc', 'pswdyind']
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];


        if (!_.isEmpty(obj.pswdyind)) {
            let gencode = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.pswdyind);
            obj.pswdyinddsc = gencode.prgedesc ? gencode.prgedesc : '';
        }


        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'pswdypar', key: ['pswdycde'] } }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.findOne = async (req, res) => {
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        pswdypar.findOne({
            where: {
                pswdycde: req.query.id
            }
            , raw: true
        }).then(async obj => {
            if (obj) {
                obj.id = obj.pswdycde;

                if (!_.isEmpty(obj.pswdyind)) {
                    let gencode = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.pswdyind);
                    obj.pswdyinddsc = gencode.prgedesc ? gencode.prgedesc : '';
                }

                return returnSuccess(200, obj, res);
            } else return returnError(req, 500, "NORECORDFOUND", res);
        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
    }
}

exports.create = async (req, res) => {



    try {
        // //Validation
        const { errors, isValid } = validatePswdypar(req.body, 'A');
        if (!isValid) return returnError(req, 400, errors, res);
        if (!_.isEmpty(req.body.pswdyind)) {
            let description = await common.retrieveSpecificGenCodes(
                req,
                "YESORNO",
                req.body.pswdyind
            );

            if (!description || _.isEmpty(description.prgedesc)) {
                return returnError(req, 400, { pswdyind: "INVALIDDATAVALUE" }, res);
            }
        }

        pswdypar.findOne({
            where: {
                pswdycde: req.body.pswdycde
            }, raw: true
        }).then(async data => {
            if (data) return returnError(req, 500, "RECORDEXISTS", res);

            const new_prd = {
                pswdycde: req.body.pswdycde,
                pswdydsc: req.body.pswdydsc,
                pswdyind: req.body.pswdyind,
                pswdyind: req.body.pswdyind,
                crtuser: req.user.psusrunm,
                mntuser: req.user.psusrunm,
            }

            pswdypar.create(new_prd).then(async data => {
                let created = data.get({ plain: true });
                common.writeMntLog('pswdypar', null, null, created.pswdycde, 'A', req.user.psusrunm, "Work Day Parameter", created.pswdycde);
                return returnSuccessMessage(req, 200, "RECORDCREATED", res);
            })
        })
    } catch (err) {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.update = async (req, res) => {

    try {
        if (!req.body.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);

        // //Validation
        const { errors, isValid } = validatePswdypar(req.body, 'C');
        if (!isValid) return returnError(req, 400, errors, res);
        if (!_.isEmpty(req.body.pswdyind)) {
            let description = await common.retrieveSpecificGenCodes(
                req,
                "YESORNO",
                req.body.pswdyind
            );

            if (!description || _.isEmpty(description.prgedesc)) {
                return returnError(req, 400, { pswdyind: "INVALIDDATAVALUE" }, res);
            }
        }
      
        await pswdypar.findOne({
            where: {
                pswdycde: req.body.id
            }
            , raw: true, attributes: { exclude: ['mntuser', 'createdAt'] }
        }).then(async found => {
            if (found) {
                // if (isNaN(new Date(req.body.updatedAt)) || (new Date(found.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

                const new_prd = {
                    pswdydsc: req.body.pswdydsc,
                    psdsglds: req.body.psdsglds,
                    pswdyind: req.body.pswdyind,
                    mntuser: req.user.psusrunm,
                }

                pswdypar.update(new_prd,
                    {
                        where: {
                            id: found.id
                        }, returning: true, plain: true
                    }).then(async () => {

                        common.writeMntLog('pswdypar', found, await pswdypar.findByPk(found.id, { raw: true }), found.pswdycde, 'C', req.user.psusrunm, "Work Day Parameter", found.pswdycde);
                        return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
                    })
            } else return returnError(req, 500, "NORECORDFOUND", res);
        });
    } catch (err) {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.delete = async (req, res) => {

    try {
        if (!req.body.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);

        await pswdypar.findOne({
            where: {
                pswdycde: req.body.id
            }
            , raw: true
        }).then(found => {
            if (found) {
                pswdypar.destroy({
                    where: { id: found.id }
                }).then(async () => {
                    common.writeMntLog('pswdypar', null, null, found.pswdycde, 'D', req.user.psusrunm, 'Work Day Parameter', found.pswdycdes);
                    return returnSuccessMessage(req, 200, "RECORDDELETED", res);
                }).catch(err => {
                    console.log(err);
                    return returnError(req, 500, "UNEXPECTEDERROR", res);
                });
            } else return returnError(req, 500, "NORECORDFOUND", res);
        });
    } catch (err) {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}