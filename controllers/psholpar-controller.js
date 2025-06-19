// Import
const db = require("../models");
const _ = require("lodash");
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require("uuid");

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',  // or 'postgres', 'sqlite', etc. depending on your DB
});



// Table File
const psholpar = db.psholpar;

// Common Function
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');

// Input Validation
const validatePsholpar = require('../validation/psholpar-validation');

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
                { psholcde: { [Op.eq]: req.query.search } },
                { psholcde: { [Op.like]: '%' + req.query.search + '%' } },
                { psholdsc: { [Op.eq]: req.query.search } },
                { psholdsc: { [Op.like]: '%' + req.query.search + '%' } }
            ]
        }
    }

    if (req.query.psholtyp && !_.isEmpty(req.query.psholtyp))
        option.psholtyp = req.query.psholtyp;

    if (req.query.year && !_.isEmpty('' + req.query.year)) {
        const year = parseInt(req.query.year, 10);

        const fromDate = new Date(year, 0, 1);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(year + 1, 0, 1);
        toDate.setHours(23, 59, 59, 999);


        option.psholdat = {
            [Op.and]: [
                { [Op.gte]: fromDate },
                { [Op.lte]: toDate }
            ]
        };
    }
    if (req.query.psholtyp && !_.isEmpty(req.query.psholtyp) && req.query.psholtyp == "F") {
        const { count, rows } = await psholpar.findAndCountAll({
            limit: parseInt(limit),
            offset: from,
            where: option,
            order: [
                [sequelize.literal(`DATE_FORMAT(psholdat, '%m-%d')`), 'ASC'] // Custom sorting based on month and day
            ],
            raw: true,
            attributes: [
                ['psholcde', 'id'], 'psholcde', 'psholdsc', 'psholtyp', 'psholdat'
            ]
        });
        let newRows = [];
        for (var i = 0; i < rows.length; i++) {
            let obj = rows[i];


            if (!_.isEmpty(obj.psholsts)) {
                let gencode = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.psholsts);
                obj.psholstsdsc = gencode.prgedesc ? gencode.prgedesc : '';
            }
            if (!_.isEmpty(obj.psholtyp)) {
                let gencode = await common.retrieveSpecificGenCodes(req, 'HOLTYPE', obj.psholtyp);
                obj.psholtypdsc = gencode.prgedesc ? gencode.prgedesc : '';
            }

            if (!_.isEmpty('' + obj.psholstd)) {
                obj.psholstd = await common.formatDate(obj.psholstd, "/");
            }

            if (!_.isEmpty('' + obj.psholdat)) {
                obj.psholdat = await common.formatDate(obj.psholdat, "/");
            }

            // if (!_.isEmpty('' + obj.psholday)) {
            //     obj.psholday = await common.format_number(obj.psholday, true);
            // }

            newRows.push(obj);
        }

        if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'psholpar', key: ['psholcde'] } }, res);
        else return returnSuccess(200, { total: 0, data: [] }, res);
    } else {
        const { count, rows } = await psholpar.findAndCountAll({
            limit: parseInt(limit),
            offset: from,
            where: option,
            order: [['psholdat', 'ASC']],
            raw: true,
            attributes: [['psholcde', 'id'], 'psholcde', 'psholdsc', 'psholtyp', 'psholdat']
        });

        let newRows = [];
        for (var i = 0; i < rows.length; i++) {
            let obj = rows[i];


            if (!_.isEmpty(obj.psholsts)) {
                let gencode = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.psholsts);
                obj.psholstsdsc = gencode.prgedesc ? gencode.prgedesc : '';
            }
            if (!_.isEmpty(obj.psholtyp)) {
                let gencode = await common.retrieveSpecificGenCodes(req, 'HOLTYPE', obj.psholtyp);
                obj.psholtypdsc = gencode.prgedesc ? gencode.prgedesc : '';
            }

            if (!_.isEmpty('' + obj.psholstd)) {
                obj.psholstd = await common.formatDate(obj.psholstd, "/");
            }

            if (!_.isEmpty('' + obj.psholdat)) {
                obj.psholdat = await common.formatDate(obj.psholdat, "/");
            }

            // if (!_.isEmpty('' + obj.psholday)) {
            //     obj.psholday = await common.format_number(obj.psholday, true);
            // }

            newRows.push(obj);
        }

        if (count > 0) return returnSuccess(200, { total: count, data: newRows, extra: { file: 'psholpar', key: ['psholcde'] } }, res);
        else return returnSuccess(200, { total: 0, data: [] }, res);
    }



}

exports.findOne = async (req, res) => {
    if (!req.query.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        psholpar.findOne({
            where: {
                psholcde: req.query.id
            }
            , raw: true
        }).then(async obj => {
            if (obj) {
                obj.id = obj.psholcde;

                if (!_.isEmpty(obj.psholsts)) {
                    let gencode = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.psholsts);
                    obj.psholstsdsc = gencode.prgedesc ? gencode.prgedesc : '';
                }




                if (!_.isEmpty(obj.psholtyp)) {
                    let gencode = await common.retrieveSpecificGenCodes(req, 'HOLTYPE', obj.psholtyp);
                    obj.psholtypdsc = gencode.prgedesc ? gencode.prgedesc : '';
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
        // Validation
        const { errors, isValid } = validatePsholpar(req.body, 'A');
        if (!isValid) return returnError(req, 400, errors, res);

        // if (!_.isEmpty(req.body.psholsts)) {
        //     let description = await common.retrieveSpecificGenCodes(req, "YESORNO", req.body.psholsts);
        //     if (!description || _.isEmpty(description.prgedesc)) {
        //         return returnError(req, 400, { psholsts: "INVALIDDATAVALUE" }, res);
        //     }
        // }

        if (!_.isEmpty(req.body.psholtyp)) {
            let description = await common.retrieveSpecificGenCodes(req, "HOLTYPE", req.body.psholtyp);
            if (!description || _.isEmpty(description.prgedesc)) {
                return returnError(req, 400, { psholtyp: "INVALIDDATAVALUE" }, res);
            }
        }

        const recordCount = req.body.psholday || 1;

        let psholdat = req.body.psholdat ? new Date(req.body.psholdat) : new Date();

        for (let i = 0; i < recordCount; i++) {
            let ref = uuidv4();
            const new_prd = {
                psholcde: ref,
                psholdsc: req.body.psholdsc,
                psholtyp: req.body.psholtyp,
                pshollds: req.body.pshollds,
                psholdat: psholdat,
                crtuser: req.user.psusrunm,
                mntuser: req.user.psusrunm,
            };
            await psholpar.create(new_prd).then(async data => {
                let created = data.get({ plain: true });
                let formatDt = await common.formatDate(created.psholdat, "/");

                common.writeMntLog('psholpar', null, null, created.psholcde + '-' + formatDt, 'A', req.user.psusrunm, "Holiday Parameter", created.psholcde + '-' + formatDt);
            });

            psholdat.setDate(psholdat.getDate() + 1);
        }

        return returnSuccessMessage(req, 200, "RECORDSCREATED", res);

    } catch (err) {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
};

exports.update = async (req, res) => {

    try {
        if (!req.body.id) return returnError(req, 500, "RECORDIDISREQUIRED", res);

        // //Validation
        const { errors, isValid } = validatePsholpar(req.body, 'C');
        if (!isValid) return returnError(req, 400, errors, res);
        // if (!_.isEmpty(req.body.psholsts)) {
        //     let description = await common.retrieveSpecificGenCodes(
        //         req,
        //         "YESORNO",
        //         req.body.psholsts
        //     );

        //     if (!description || _.isEmpty(description.prgedesc)) {
        //         return returnError(req, 400, { psholsts: "INVALIDDATAVALUE" }, res);
        //     }
        // }
        if (!_.isEmpty(req.body.psholtyp)) {
            let description = await common.retrieveSpecificGenCodes(
                req,
                "HOLTYPE",
                req.body.psholtyp
            );

            if (!description || _.isEmpty(description.prgedesc)) {
                return returnError(req, 400, { psholtyp: "INVALIDDATAVALUE" }, res);
            }
        }
        await psholpar.findOne({
            where: {
                psholcde: req.body.id
            }
            , raw: true, attributes: { exclude: ['mntuser', 'createdAt', 'updatedAt'] }
        }).then(async found => {
            if (found) {
                // if (isNaN(new Date(req.body.updatedAt)) || (new Date(found.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

                const new_prd = {
                    // psholday: req.body.psholday,
                    psholdsc: req.body.psholdsc,
                    pshollds: req.body.pshollds,
                    // psholsts: req.body.psholsts,
                    // psholdat: req.body.psholdat,
                    // psholstd: new Date(),
                    // psholtyp: req.body.psholtyp,
                    mntuser: req.user.psusrunm,
                }

                psholpar.update(new_prd,
                    {
                        where: {
                            id: found.id
                        }, returning: true, plain: true
                    }).then(async () => {
                        let formatDt = await common.formatDate(found.psholdat, "/");

                        common.writeMntLog('psholpar', found, await psholpar.findByPk(found.id, { raw: true }), found.psholcde + '-' + formatDt, 'C', req.user.psusrunm, "Holiday Parameter", found.psholcde + '-' + formatDt);
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

        await psholpar.findOne({
            where: {
                psholcde: req.body.id
            }
            , raw: true
        }).then(found => {
            if (found) {
                psholpar.destroy({
                    where: { id: found.id }
                }).then(async () => {
                    let formatDt = await common.formatDate(found.psholdat, "/");

                    common.writeMntLog('psholpar', null, null, found.psholcde + '-' + formatDt, 'D', req.user.psusrunm, 'Holiday Parameter', found.psholcde + '-' + formatDt);
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