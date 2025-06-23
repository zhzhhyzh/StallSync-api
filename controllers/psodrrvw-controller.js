// Import
const db = require("../models");
const _ = require("lodash");

//Table
const psodrrvw = db.psodrrvw;
const psodrpar = db.psodrpar;


// Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

//Input Validation
const { validatePsodrrvwInput } = require("../validation/psodrrvw-validation");
const { raw } = require("express");

exports.list = async (req, res) => {
  // default 10 records per page
    let limit = 10;
    if (req.query.limit) limit = parseInt(req.query.limit);

    // page offset
    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * limit;

    filter
    const { psodruid, rating, crtusr } = req.query;

    if (!psodruid || _.isEmpty(psodruid)) {
  return returnError(req, 400, { psodruid: "REQUIRED" }, res);
}

    let option = {
        [Op.and]: [{psodruid: psodruid} ]
    };

    if (rating && !_.isEmpty(rating)) {
        option[Op.and].push({ psrvwrtg: rating });
    }

    if (crtusr && !_.isEmpty(crtusr)) {
        option[Op.and].push({ crtusr: crtusr });
    }

    const { count, rows } = await psodrrvw.findAndCountAll({
        where: option,
        limit: parseInt(limit),
        offset: from,
        raw: true,
        attributes: [
            "psodruid",
            "psrvwimg",
        //    "psrvwvid",
            "psrvwrtg",
            "psrvwdsc",
            "crtusr",
        //    "mntusr",
            "createdAt",
            "updatedAt"
        ],
        order: [["createdAt", "asc"]],
    });


    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        // Format Dates
        obj.createdAt = await common.formatDate(obj.createdAt, "/");
        obj.updatedAt = await common.formatDate(obj.updatedAt, "/");

        newRows.push(obj);
    }

    if (count > 0)
            return returnSuccess(
                200,
                {
                    total: count,
                    data: newRows,
                    extra: { file: "psodrrvw", key: ["psodruid", "crtusr"] },
                },
                res
            );
        else return returnSuccess(200, { total: 0, data: [] }, res);
}



exports.findOne = async (req, res) => {
    const psorduid = req.query.psodruid? req.query.psodruid : "";
    const crtusr = req.query.crtusr? req.query.crtusr : "";
    
    if (psorduid )
}


exports.create = async (req, res) => {
    // Validate Input
    const {errors, isValid} = validatePsodrrvwInput(req.body, "A");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    
    try {
        // Check if order exists
        const order = await psodrpar.findOne({ where: { psodruid } });

        if (!order) {
            return returnError(req, 400, { psodruid: "ORDERNOTFOUND" }, res);
        }

        // Check Review duplication
        const exist = await psodrrvw.findOne({
            where: {
                psodruid: req.body.psodruid,
                crtusr: req.body.crtusr
            },
            raw: true
        });

        if (exist) {
            return returnError(req, 400, "RECORDEXISTS", res);
        }

        // create review
        await psodrrvw.create({

            psodruid: req.body.psodruid,
            psrvwimg: req.body.psrvwimg ? req.body.psrvwimg : "",
            psrvwvid: req.body.psrvwvid ? req.body.psrvwvid : "",
            psrvwrtg: req.body.psrvwrtg,
            psrvwdsc: req.body.psrvwdsc,
            crtusr: req.user.psusrunm,
            mntusr: req.user.psusrunm

        }).then(async (data) => {
            let created = data.get({plain: true});
            common.writeMntLog(
                "psodrrvw",
                null,
                null,
                created.psodruid,
                "A",
                req.user.psusrunm,
                "",
                [created.psodruid, created.crtusr]
            );

            return returnSuccessMessage(200, "RECORDCREATED", res);

        });
    }catch (err) {
        console.error("Error creating review:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.update = async (req, res) => {
    const { psodruid, crtusr } = req.body;
    if (_.isEmpty(psodruid) || _.isEmpty(crtusr)) {
            return returnError(req, 400, {
            psodruid: "ORDERIDREQUIRED",
            crtusr: "USERNAMEISREQUIRED"
        }, res);
        }

    // Validate input
    const { errors, isValid } = validatePsodrrvwInput(req.body, "C");
    if (!isValid) return returnError(req, 400, errors, res);

    try {
        // Check Record exists
        const exist = await psodrrvw.findOne({
            where: {
                psodruid: psodruid,
                crtusr: crtusr
            },
            raw: true
        });

        if (!exist) {
            return returnError(req, 400, "NORECORDFOUND", res);
        }

        // Update review
        await psodrrvw.update(
            {
                psrvwimg: req.body.psrvwimg ? req.body.psrvwimg : "",
                psrvwvid: req.body.psrvwvid ? req.body.psrvwvid : "",
                psrvwrtg: req.body.psrvwrtg,
                psrvwdsc: req.body.psrvwdsc,
                mntusr: req.user.psusrunm,
                updatedAt: new Date()
            },
            {
                where: {
                    psodruid: psodruid,
                    crtusr: crtusr
                }
            }
        ).then(async (data) => {
            common.writeMntLog(
                "psodrrvw",
                null,
                null,
                psodruid,
                "C",
                req.user.psusrunm,
                "",
                [psodruid, crtusr]
            );

            return returnSuccessMessage(200, "RECORDUPDATED", res);
        });
    } catch (err) {
        console.error("Error updating review:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.delete = async (req, res) => {
    const { psodruid, crtusr } = req.query;
    if (_.isEmpty(psodruid) || _.isEmpty(crtusr)) {
        return returnError(req, 400, {
            psodruid: "ORDERIDREQUIRED",
            crtusr: "USERNAMEISREQUIRED"
        }, res);
    }

    try {
        // Check Record exists
        const exist = await psodrrvw.findOne({
            where: {
                psodruid: psodruid,
                crtusr: crtusr
            },
            raw: true 
        });

        if (!exist) {
            return returnError(req, 400, "NORECORDFOUND", res);
        }

        // Delete review
        await psodrrvw.destroy({
            where: {
                psodruid: psodruid,
                crtusr: crtusr
            }
        }).then(async (data) => {
            common.writeMntLog(
                "psodrrvw",
                null,
                null,
                psodruid,
                "D",
                req.user.psusrunm,
                "",
                [psodruid, crtusr]
            );

            return returnSuccessMessage(200, "RECORDDELETED", res);
        });
    } catch (err) {
        console.error("Error deleting review:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}



