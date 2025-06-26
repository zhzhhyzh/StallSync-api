// Import
const db = require("../models");
const _ = require("lodash");

//Table
const psmbrcrt = db.psmbrcrt;
const psmrcpar = db.psmrcpar;
const psprdpar = db.psprdpar;

//Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const connection = require("../common/db");

//Input Validation
const validatePsmbrcrtInput = require("../validation/psmbrcrt-validation");
const { ExpressValidator } = require("express-validator");
const { where } = require("sequelize");
const { psitmcno } = require("../constant/fieldNames");


exports.list = async (req, res) => {

    const psmrcuid = req.query.psmrcuid ? req.query.psmrcuid : "";
    if (!psmrcuid || psmrcuid == "") {
        return returnError(req, 500, "RECORDIDISREQUIRED", res);
    }

    let userId = "";
    let cartId = "";
    if (req.user.psusrtyp == "MBR") {
        console.log("JKJKWDJW", cartId)

        userId = req.user.psmbruid;
        cartId = req.user.psmbrcar;
    } else {
        return returnError(req, 500, "INVALIDAUTHORITY", res);
    }

    console.log("JKJKWDJW", cartId)
    console.log("JKJKWDJW", req.user.psusrtyp)
    // // default 10 records per page
    // let limit = 10;
    // if (req.query.limit) limit = parseInt(req.query.limit);

    // // page offset
    // let from = 0;
    // if (!req.query.page) from = 0;
    // else from = parseInt(req.query.page) * limit;

    // // filter
    let options = {
        psmbrcar: cartId
    };

    try {
        const { count, rows } = await psmbrcrt.findAndCountAll({
            where: options,
            raw: true,
            attributes: [
                "id",
                "psmbrcar",
                "psitmcno",
                "psmrcuid",
                "psprduid",
                "psitmqty",
                // "psitmdsc",
                "psitmunt",
                "psitmsbt",
                "psitmrmk",
            ],
            order: [["psitmcno", "ASC"]],
        });

        if (count > 0)
            return returnSuccess(
                200,
                {
                    total: count,
                    data: rows,
                    extra: { file: "psmbrcrt", key: ["id"] },
                    cartId: cartId,
                },
                res
            );
        else return returnSuccess(200, {
            total: 0, data: [],
            cartId: cartId,

        }, res);
    } catch (err) {
        console.log("Cart list error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.create = async (req, res) => {

    const { errors, isValid } = validatePsmbrcrtInput(req.body, "A");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }
    const {
        psmbrcar,
        // psitmcno,
        psmrcuid,
        psprduid,
        psitmqty,
        // psitmdsc,
        // psitmunt,
        // psitmsbt,
        psitmrmk
    } = req.body;
    //Find Merchant (check existance only)
    const merchant = await psmrcpar.findOne({
        where: {
            psmrcuid: psmrcuid
        }, raw: true
    })

    //Find Product (check exist, get unit price)
    const product = await psprdpar.findOne({
        where: {
            psprduid: psprduid
        }, raw: true, attributes: ['psprdpri']
    })
    //Calculate subtotal (qty * unit)
    const psitmunt = product.psprdpri;
    const psitmsbt = parseFloat(product.psprdpri) * psitmqty;


    if (merchant && product)
        //Find member cart (check existance get current running itmcno)
        await psmbrcrt.findOne({
            where: {
                psmbrcar: psmbrcar,
                psmrcuid: psmrcuid,
            }, raw: true,
            attributes: ['psmbrcar', 'psmrcuid', 'psitmcno'],
            order: [['psitmcno', 'DESC']]
        }).then(async memberCart => {
            let running = 1;
            if (memberCart) {
                // Having item in cart
                //Assign new running item no
                //**No sequence order needed
                running = parseInt(memberCart.psitmcno) + 1;
            }
            //Add cart
            await psmbrcrt.create({
                psmbrcar,
                psmrcuid,
                psprduid,
                psitmcno: running,
                psitmqty,
                psitmunt,
                psitmsbt,
                psitmrmk
            });
            //return success 

            return returnSuccessMessage(req, 200, "RECORDCREATED", res)

        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res)
        })
    else return returnError(req, 400, { psmrcuid: "INVALIDDATAVALUE", psprduid: "INVALIDDATAVALUE" }, res)

}

exports.update = async (req, res) => {

    const { errors, isValid } = validatePsmbrcrtInput(req.body, "C");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }

    const {
        psmbrcar,
        psmrcuid,
        psitmcno,
        psprduid,
        psitmqty,
        psitmrmk
    } = req.body;

    if (!psmbrcar || !psitmcno || !psmrcuid) {
        return returnError(req, 500, {
            psmbrcar: "FIELDISREQUIRED",
            psitmcno: "FIELDISREQUIRED",
            psmrcuid: "FIELDISREQUIRED"
        }, res);
    }

    //Find Merchant (check existance only)
    const merchant = await psmrcpar.findOne({
        where: {
            psmrcuid: psmrcuid
        }, raw: true
    })

    //Find Product (check exist, get unit price)
    const product = await psprdpar.findOne({
        where: {
            psprduid: psprduid
        }, raw: true, attributes: ['psprdpri']
    })
    //Calculate subtotal (qty * unit)
    const psitmunt = product.psprdpri;
    const psitmsbt = parseFloat(product.psprdpri) * psitmqty;


    if (merchant && product)
        //Find member cart (check existance get current running itmcno)
        await psmbrcrt.findOne({
            where: {
                psmbrcar: psmbrcar,
                psmrcuid: psmrcuid,
                psitmcno: psitmcno,

            }, raw: true,
            attributes: ['psmbrcar', 'psmrcuid', 'psitmcno', 'id'],
            order: [['psitmcno', 'DESC']]
        }).then(async memberCart => {

            if (memberCart) {
                //Add cart
                await psmbrcrt.update({
                    // psmbrcar,
                    // psmrcuid,
                    // psprduid,
                    // psitmcno,
                    psitmqty,
                    psitmunt,
                    psitmsbt,
                    psitmrmk
                }, {
                    where: {
                        id: memberCart.id
                    }
                });
            } else {
                return returnError(req, 500, { psmbrcar: "NORECORDFOUND", psmrcuid: "NORECORDFOUND", psitmcno: "NORECORDFOUND" }, res)
            }
            //return success 
            return returnSuccessMessage(req, 200, "RECORDCREATED", res)

        }).catch(err => {
            console.log(err);
            return returnError(req, 500, "UNEXPECTEDERROR", res)
        })
    else return returnError(req, 400, { psmrcuid: "INVALIDDATAVALUE", psprduid: "INVALIDDATAVALUE" }, res)


}

exports.delete = async (req, res) => {
    const id = req.body.id ? req.body.id : "";
    if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
    const t = await connection.sequelize.transaction();


    try {
        const exist = await psmbrcrt.findOne({
            where: {
                id
            },
            raw: true,
        });

        if (!exist) return returnError(req, 400, "NORECORDFOUND", res);

        await psmbrcrt.destroy({
            where: {
                id: exist.id
            },
            transaction: t
        }).catch(async err => {
            console.log(err);
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res)
        });

        //Resequence Number
        let option = {};

        option = {
            psitmcno: { [Op.gt]: exist.psitmcno },
            psmrcuid: exist.psmrcuid,
            psmbrcar: exist.psmbrcar,
        }
        let affected_record = await psmbrcrt.findAll({
            order: [['psitmcno', 'asc']],
            raw: true,
            attributes: ['id','psitmcno'],
            where: option,
            raw: true
        });
        console.log(affected_record);
        let err_ind = false;
        for (var i = 0; i < affected_record.length; i++) {
            console.log("WATCHMEMEM:", i, "\nKLKLKLL:",affected_record[i]);

            await psmbrcrt.update({
                psitmcno: parseInt(affected_record[i].psitmcno) - 1
            }, {
                where: { id: affected_record[i].id }, transaction: t
            }).catch(async err => {
                console.log("Error updating sequence", err);
                err_ind = true;
            });
            if (err_ind) break;
        }
        if (err_ind) {
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);
        }

        await t.commit();
        return returnSuccessMessage(req, 200, "RECORDDELETED", res);

    } catch (err) {
        console.log("Cart delete error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}