// Import
const db = require("../models");
const _ = require("lodash");
const fs = require("fs");
const genConfig = require("../constant/generalConfig");
const connection = require("../common/db");


//Table
const psordrvw = db.psordrvw;
const psordpar = db.psordpar;


// Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

//Input Validation
const validatePsordrvwInput = require("../validation/psordrvw-validation");
const { raw } = require("express");

exports.list = async (req, res) => {
    let psmbruid = "";
    if (req.user.psusrtyp == "MBR") {
        psmbruid = req.user.psmbruid;
    }
    // default 10 records per page
    let limit = 10;
    if (req.query.limit) limit = parseInt(req.query.limit);

    // page offset
    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * limit;

    // filter
    let option = {
        [Op.and]: []
    }
    const rating = req.query.psrvwrtg;

    if (req.query.search && !_.isEmpty(req.query.search)) {
        option[Op.and].push({
            [Op.or]: [
                { psorduid: { [Op.eq]: req.query.search } },
                { psorduid: { [Op.like]: `%${req.query.search}%` } },
                { psorddsc: { [Op.eq]: req.query.search } },
                { psorddsc: { [Op.like]: `%${req.query.search}%` } }
            ]
        });
    }


    if (rating && !_.isEmpty(rating)) {
        option[Op.and].push({ psrvwrtg: rating });
    }



    const { count, rows } = await psordrvw.findAndCountAll({
        where: option,
        limit: parseInt(limit),
        offset: from,
        raw: true,
        attributes: [
            ["psorduid", "id"],
            "psorduid",
            "psrvwimg",
            "psrvwvid",
            "psrvwdsc",
            "psrvwrtg",
            "createdAt",
        ],
        order: [["createdAt", "desc"]],
    });


    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        obj.createdAt = await common.formatDateTime(obj.createdAt);

        newRows.push(obj);
    }

    if (count > 0)
        return returnSuccess(
            200,
            {
                total: count,
                data: newRows,
                extra: { file: "psordrvw", key: ["psorduid"] },
            },
            res
        );
    else return returnSuccess(200, { total: 0, data: [] }, res);
}



exports.findOne = async (req, res) => {
    const id = req.query.id;
    if (!id) return returnError(req, 500, "RECORDIDISREQUIRED", res);
    else {
        psordrvw.findOne({
            where: {
                psorduid: id,

            }, raw: true,
        }).then(async obj => {
            if (!obj) return returnError(req, 500, "NORECORDFOUND", res);
            return returnSuccess(200, obj, res);

        }).catch(err => {
            console.error(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
        )
    }
}


exports.create = async (req, res) => {
    // Validate Input
    const { errors, isValid } = validatePsordrvwInput(req.body, "A");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    const psorduid = req.body.psorduid;



    try {
        // Check if order exists
        const order = await psordpar.findOne({ where: { psorduid } });

        if (!order) {
            return returnError(req, 400, { psorduid: "NORECORDFOUND" }, res);
        }

        let image, video = false;
        if (!_.isEmpty(req.body.psrvwimg)) {
            let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psrvwimg);
            if (!img_exist) return returnError(req, 400, { psrvwimg: "INVALIDDATAVALUE" }, res);
            image = !image;
        }

        if (!_.isEmpty(req.body.psrvwvid)) {
            let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psrvwvid);
            if (!img_exist) return returnError(req, 400, { psrvwvid: "INVALIDDATAVALUE" }, res);
            video = !video;
        }



        // Check Review duplication
        const exist = await psordrvw.findOne({
            where: {
                psorduid: req.body.psorduid,
            },
            raw: true
        });

        if (exist) {
            return returnError(req, 400, "RECORDEXISTS", res);
        }
        const t = await connection.sequelize.transaction();


        // create review
        await psordrvw.create({

            psorduid: req.body.psorduid,
            psrvwimg: req.body.psrvwimg ? req.body.psrvwimg : "",
            psrvwvid: req.body.psrvwvid ? req.body.psrvwvid : "",
            psrvwrtg: req.body.psrvwrtg,
            psrvwdsc: req.body.psrvwdsc,
            crtuser: req.user.psusrunm,
            mntuser: req.user.psusrunm

        }, { transaction: t }).then(async (data) => {
            let created = data.get({ plain: true });

            if (image) {
                await common
                    .writeImage(
                        genConfig.documentTempPath,
                        genConfig.reviewImgPath,
                        created.psrvwimg,
                        // uuidv4(),
                        req.user.psusrunm,
                        8,

                    )
                    .catch(async (err) => {
                        console.log(err);
                        await t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });

            }

            if (video) {
                await common
                    .writeImage(
                        genConfig.documentTempPath,
                        genConfig.reviewVidPath,
                        created.psrvwvid,
                        // uuidv4(),
                        req.user.psusrunm,
                        9,
                    )
                    .catch(async (err) => {
                        console.log(err);
                        await t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });

            }
            t.commit();
            common.writeMntLog(
                "psordrvw",
                null,
                null,
                created.psorduid,
                "A",
                req.user.psusrunm,
                "",
                [created.psorduid, created.crtuser]
            );

            return returnSuccessMessage(200, "RECORDCREATED", res);

        });
    } catch (err) {
        console.error("Error creating review:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.update = async (req, res) => {

    //Id getting
    const id = req.body.id ? req.body.id : "";
    if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

    //Validation
    const { errors, isValid } = validatePsordrvwInput(req.body, "C");
    if (!isValid) return returnError(req, 400, errors, res);


    try {
        // Check Record exists
        const exist = await psordrvw.findOne({
            where: {
                psorduid: id,
            },
            raw: true
        });

        if (!exist) {
            return returnError(req, 400, "NORECORDFOUND", res);
        }

        let image, video = false;

        if (exist.psrvwimg != req.body.psrvwimg) {
            // Image Validation
            let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psrvwimg);
            if (!img_exist) return returnError(req, 400, { psrvwimg: "INVALIDDATAVALUE" }, res);
            image = true;
        }


        if (exist.psrvwvid != req.body.psrvwvid) {
            // Image Validation
            let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psrvwvid);
            if (!img_exist) return returnError(req, 400, { psrvwvid: "INVALIDDATAVALUE" }, res);
            video = true;
        }

        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        const t = await connection.sequelize.transaction();


        // Update review
        await psordrvw.update(
            {
                psrvwimg: req.body.psrvwimg ? req.body.psrvwimg : "",
                psrvwvid: req.body.psrvwvid ? req.body.psrvwvid : "",
                psrvwrtg: req.body.psrvwrtg,
                psrvwdsc: req.body.psrvwdsc,
                mntuser: req.user.psusrunm,
            },
            {
                where: {
                    psorduid: id,
                }
            }, { transaction: t }
        ).then(async data => {
            if (image) {
                if (fs.existsSync(genConfig.reviewImgPath + exist.psrvwimg)) {
                    fs.unlinkSync(genConfig.reviewImgPath + exist.psrvwimg);
                }

                await common
                    .writeImage(
                        genConfig.documentTempPath,
                        genConfig.reviewImgPath,
                        req.body.psrvwimg,
                        // uuidv4(),
                        req.user.psusrunm,
                        8,

                    )
                    .catch(async (err) => {
                        console.log(err);
                        await t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });
            }

            if (video) {
                if (fs.existsSync(genConfig.reviewVidPath + exist.psrvwvid)) {
                    fs.unlinkSync(genConfig.reviewVidPath + exist.psrvwvid);
                }

                await common
                    .writeImage(
                        genConfig.documentTempPath,
                        genConfig.reviewVidPath,
                        req.body.psrvwvid,
                        // uuidv4(),
                        req.user.psusrunm,
                        9,

                    )
                    .catch(async (err) => {
                        console.log(err);
                        await t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });
            }

            t.commit();

            common.writeMntLog(
                "psordrvw",
                exist,
                await psordrvw.findByPk(exist.id, { raw: true }),
                id,
                "C",
                req.user.psusrunm,

            );

            return returnSuccessMessage(200, "RECORDUPDATED", res);
        });
    } catch (err) {
        console.error("Error updating review:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}
exports.delete = async (req, res) => {
    const id = req.body.id ? req.body.id : "";
    if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
    const t = await connection.sequelize.transaction();

    await psordrvw
        .findOne({
            where: {
                psorduid: id,
            },
            raw: true
        })
        .then((trnscd) => {
            if (trnscd) {
                psordrvw
                    .destroy({
                        where: { psorduid: id },
                    }, { transaction: t })
                    .then(async () => {


                        try {

                            if (fs.existsSync(genConfig.reviewImgPath + trnscd.psrvwimg)) {
                                fs.unlinkSync(genConfig.reviewImgPath + trnscd.psrvwimg);
                            }
                        } catch (err) {
                            console.log("Remove Image Error :", err);
                            await t.rollback();
                            return returnError(req, 500, "UNEXPECTEDERROR", res);
                        }

                        try {

                            if (fs.existsSync(genConfig.reviewVidPath + trnscd.psrvwvid)) {
                                fs.unlinkSync(genConfig.reviewVidPath + trnscd.psrvwvid);
                            }
                        } catch (err) {
                            console.log("Remove Video Error :", err);
                            await t.rollback();
                            return returnError(req, 500, "UNEXPECTEDERROR", res);
                        }
                        t.commit();
                        common.writeMntLog(
                            "psordrvw",
                            null,
                            null,
                            trnscd.psorduid,
                            "D",
                            req.user.psusrunm,
                            "",
                            trnscd.psorduid
                        );

                        return returnSuccessMessage(req, 200, "RECORDDELETED", res);
                    }).catch(async (err) => {
                        console.log(err);
                        await t.rollback();
                        return returnError(req, 500, "UNEXPECTEDERROR", res);
                    });


            } else return returnError(req, 500, "NORECORDFOUND", res);
        })
        .catch((err) => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        });
};
