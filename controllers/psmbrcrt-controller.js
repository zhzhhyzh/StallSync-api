// Import
const db = require("../models");
const _ = require("lodash");

//Table
const psmbrcrt = db.psmbrcrt;

//Common Functions
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");

//Input Validation
const validatePsmbrcrtInput = require("../validation/psmbrcrt-validation");
const { ExpressValidator } = require("express-validator");


exports.listCartItem = async (req, res) => {

    const psmbrcar = req.query.psmbrcar ? req.query.psmbrcar : "";
    if (!psmbrcar || psmbrcar == "") {
        return returnError(req, 400, "RECORDIDISREQUIRED", res);
    }

    // // default 10 records per page
    // let limit = 10;
    // if (req.query.limit) limit = parseInt(req.query.limit);

    // // page offset
    // let from = 0;
    // if (!req.query.page) from = 0;
    // else from = parseInt(req.query.page) * limit;

    // // filter
    // let options = {};

    try {
        const { count, rows } = await psmbrcrt.findAndCountAll({
            where: {psmbrcar},
            raw: true,
            attributes: [
                //"psmbrcar",
                "psitmcno",
                "psmrcuid",
                "psprduid",
                "psitmqty",
                "psitmdsc",
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
                    extra: { file: "psmbrcrt", key: ["psmbrcar", "psitmcno"] },
                },
                res
            );
        else return returnSuccess(200, { total: 0, data: [] }, res);
    } catch (err) {
        console.log("Cart list error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.addCartItem = async (req, res) => {

    const { errors, isValid } = validatePsmbrcrtInput(req.body, "A");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }
    const {
        psmbrcar,
        psitmcno,
        psmrcuid,
        psprduid,
        psitmqty,
        psitmdsc,
        psitmunt,
        psitmsbt,
        psitmrmk
    } = req.body;

    if (!psmbrcar || !psprduid) {
        return returnError(req, 400, {
        psmbrcar: "REQUIRED",
        psprduid: "REQUIRED"
        }, res);
    }

    try {
        const exist = await psmbrcrt.findOne({
            where: {
                psmbrcar,
                psprduid,
                psitmrmk
            },
            raw: true,
        });

        if (exist) {
            const newQty = exist.psitmqty + psitmqty;
            const newSbt = newQty * parseFloat(psitmunt);

            await psmbrcrt.update({
            psitmqty: newQty,
            psitmsbt: newSbt.toFixed(2)
        }, {
            where: {
                psmbrcar,
                psprduid,
                psitmrmk
            }
        });

        return returnSuccessMessage(req, 200, "QUANTITYUPDATED", res);
        }

    // Add new cart row with next item number
    const maxItem = await psmbrcrt.max("psitmcno", { where: { psmbrcar } });
    if (!maxItem) maxItem = 0;
    const nextItemNo = (maxItem) + 1;

    await psmbrcrt.create({
      psmbrcar,
      psitmcno: nextItemNo,
      psmrcuid,
      psprduid,
      psitmqty,
      psitmdsc,
      psitmunt,
      psitmsbt: (psitmqty * parseFloat(psitmunt)).toFixed(2),
      psitmrmk
    });

    return returnSuccessMessage(req, 200, "CARTITEMADDED", res);
        
    } catch (err) {
        console.log("Cart add error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }

}

exports.updateCartItem = async (req, res) => {

    const { errors, isValid } = validatePsmbrcrtInput(req.body, "U");
    if (!isValid) {
        return returnError(req, 400, errors, res);
    }
    const {
        psmbrcar,
        psitmcno,
        psitmqty,
        psitmsbt,
        psitmrmk
    } = req.body;

    if (!psmbrcar || !psitmcno) {
        return returnError(req, 400, {
            psmbrcar: "REQUIRED",
            psitmcno: "REQUIRED"
        }, res);
    }

    try {
        const exist = await psmbrcrt.findOne({
            where: {
                psmbrcar,
                psitmcno
            },
            raw: true,
        });

        if (!exist) return returnError(req, 404, "NORECORDFOUND", res);

        const newQty = parseInt(psitmqty);

        // // delete item if qty < 1
        // if (newQty < 1) {
        //     await psmbrcrt.destroy({
        //         where: {
        //             psmbrcar,
        //             psitmcno
        //         },
        //         raw: true,
        //     }); 

        //     // Reorder item numbers
        //     const remainingItems = await psmbrcrt.findAll({
        //         where: { psmbrcar },
        //         order: [["psitmcno", "asc"]],
        //         raw: true
        //     });

        //     // Reassign item numbers starting from 1
        //     for (let i = 0; i < remainingItems.length; i++) {
        //         await psmbrcrt.update(
        //         { psitmcno: i + 1 },
        //         { where: { psmbrcar, psitmcno: remainingItems[i].psitmcno } }
        //         );
        //     }

        //     return returnSuccessMessage(req, 200, "CARTITEMDELETED", res);
  
        // }

        const newSbt = newQty * parseFloat(exist.psitmunt);

        await psmbrcrt.update({
            psitmqty: newQty,
            psitmsbt: newSbt.toFixed(2),
            psitmrmk: psitmrmk ? psitmrmk: exist.psitmrmk
        }, {
            where: {
                psmbrcar,
                psitmcno
            }
        });

        return returnSuccessMessage(req, 200, "CARTITEMUPDATED", res);


    } catch (err) {
        console.log("Cart update error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.deleteCartItem = async (req, res) => {
    const { psmbrcar, psitmcno } = req.body;

    if (!psmbrcar || !psitmcno) {
        return returnError(req, 400, {
            psmbrcar: "REQUIRED",
            psitmcno: "REQUIRED"
        }, res);
    }

    try {
        const exist = await psmbrcrt.findOne({
            where: {
                psmbrcar,
                psitmcno
            },
            raw: true,
        });

        if (!exist) return returnError(req, 404, "NORECORDFOUND", res);

        await psmbrcrt.destroy({
            where: {
                psmbrcar,
                psitmcno
            },
            raw: true,
        });

        // Reorder item numbers
        const remainingItems = await psmbrcrt.findAll({
            where: { psmbrcar },
            order: [["psitmcno", "asc"]],
            raw: true
        });

        // Reassign item numbers starting from 1
        for (let i = 0; i < remainingItems.length; i++) {
            const currentNo = remainingItems[i].psitmcno;
            if (currentNo != (i + 1)) {
                await psmbrcrt.update(
                    { psitmcno: i + 1 },
                    { where: { psmbrcar, psitmcno: currentNo } }
                );
            }
        }

        return returnSuccessMessage(req, 200, "CARTITEMDELETED", res);

    } catch (err) {
        console.log("Cart delete error: ", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}