// Import
const db = require("../models");
const _ = require("lodash");
const Sequelize = db.Sequelize;

//Table
const psmbrcrt = db.psmbrcrt;
const psmrcpar = db.psmrcpar;
const psprdpar = db.psprdpar;
const psusrprf = db.psusrprf;

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
    console.log("JKJKWDJW", cartId);

    userId = req.user.psmbruid;
    cartId = req.user.psmbrcar;
  } else {
    return returnError(req, 500, "INVALIDAUTHORITY", res);
  }

  console.log("JKJKWDJW", cartId);
  console.log("JKJKWDJW", req.user.psusrtyp);
  // // default 10 records per page
  // let limit = 10;
  // if (req.query.limit) limit = parseInt(req.query.limit);

  // // page offset
  // let from = 0;
  // if (!req.query.page) from = 0;
  // else from = parseInt(req.query.page) * limit;

  // // filter
  let options = {
    psmbrcar: cartId,
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
    else
      return returnSuccess(
        200,
        {
          total: 0,
          data: [],
          cartId: cartId,
        },
        res
      );
  } catch (err) {
    console.log("Cart list error: ", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.create = async (req, res) => {
  const psmbrcar = req.user?.psmbrcar || "";

  if (!psmbrcar) {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  const { errors, isValid } = validatePsmbrcrtInput(req.body, "A");
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  const { psmrcuid, psprduid, psitmqty, psitmrmk } = req.body;

  try {
    // 🔍 Check Merchant and Product validity
    const [merchant, product] = await Promise.all([
      psmrcpar.findOne({ where: { psmrcuid }, raw: true }),
      psprdpar.findOne({
        where: { psprduid },
        attributes: ["psprdpri"],
        raw: true,
      }),
    ]);

    if (!merchant || !product) {
      return returnError(
        req,
        400,
        {
          psmrcuid: "INVALIDDATAVALUE",
          psprduid: "INVALIDDATAVALUE",
        },
        res
      );
    }

    const psitmunt = product.psprdpri;
    const psitmsbt = parseFloat(psitmunt) * psitmqty;

    // ✅ Check for existing cart item with same product and remark
    const existingItem = await psmbrcrt.findOne({
      where: { psmbrcar, psmrcuid, psprduid, psitmrmk },
    });

    if (existingItem) {
      const updatedQty = existingItem.psitmqty + psitmqty;
      const updatedSubtotal = parseFloat(psitmunt) * updatedQty;

      await psmbrcrt.update(
        {
          psitmqty: updatedQty,
          psitmsbt: updatedSubtotal,
        },
        {
          where: { psmbrcar, psmrcuid, psprduid, psitmrmk },
        }
      );

      return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
    }

    // 🔢 Get latest `psitmcno` to assign new running number
    const latestItem = await psmbrcrt.findOne({
      where: { psmbrcar, psmrcuid },
      order: [["psitmcno", "DESC"]],
      attributes: ["psitmcno"],
      raw: true,
    });

    const nextItmNo = latestItem ? latestItem.psitmcno + 1 : 1;

    await psmbrcrt.create({
      psmbrcar,
      psmrcuid,
      psprduid,
      psitmcno: nextItmNo,
      psitmqty,
      psitmunt,
      psitmsbt,
      psitmrmk,
    });

    return returnSuccessMessage(req, 200, "RECORDCREATED", res);
  } catch (err) {
    console.error("Unexpected error:", err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  }
};

exports.update = async (req, res) => {
  const { errors, isValid } = validatePsmbrcrtInput(req.body, "C");
  if (!isValid) {
    return returnError(req, 400, errors, res);
  }

  const { psmbrcar, psmrcuid, psitmcno, psprduid, psitmqty, psitmrmk } =
    req.body;

  if (!psmbrcar || !psitmcno || !psmrcuid) {
    return returnError(
      req,
      500,
      {
        psmbrcar: "FIELDISREQUIRED",
        psitmcno: "FIELDISREQUIRED",
        psmrcuid: "FIELDISREQUIRED",
      },
      res
    );
  }

  //Find Merchant (check existance only)
  const merchant = await psmrcpar.findOne({
    where: {
      psmrcuid: psmrcuid,
    },
    raw: true,
  });

  //Find Product (check exist, get unit price)
  const product = await psprdpar.findOne({
    where: {
      psprduid: psprduid,
    },
    raw: true,
    attributes: ["psprdpri"],
  });
  //Calculate subtotal (qty * unit)
  const psitmunt = product.psprdpri;
  const psitmsbt = parseFloat(product.psprdpri) * psitmqty;

  if (merchant && product)
    //Find member cart (check existance get current running itmcno)
    await psmbrcrt
      .findOne({
        where: {
          psmbrcar: psmbrcar,
          psmrcuid: psmrcuid,
          psitmcno: psitmcno,
        },
        raw: true,
        attributes: ["psmbrcar", "psmrcuid", "psitmcno", "id"],
        order: [["psitmcno", "DESC"]],
      })
      .then(async (memberCart) => {
        if (memberCart) {
          //Add cart
          await psmbrcrt.update(
            {
              // psmbrcar,
              // psmrcuid,
              // psprduid,
              // psitmcno,
              psitmqty,
              psitmunt,
              psitmsbt,
              psitmrmk,
            },
            {
              where: {
                id: memberCart.id,
              },
            }
          );
        } else {
          return returnError(
            req,
            500,
            {
              psmbrcar: "NORECORDFOUND",
              psmrcuid: "NORECORDFOUND",
              psitmcno: "NORECORDFOUND",
            },
            res
          );
        }
        //return success
        return returnSuccessMessage(req, 200, "RECORDCREATED", res);
      })
      .catch((err) => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
  else
    return returnError(
      req,
      400,
      { psmrcuid: "INVALIDDATAVALUE", psprduid: "INVALIDDATAVALUE" },
      res
    );
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  const t = await connection.sequelize.transaction();

  try {
    const exist = await psmbrcrt.findOne({
      where: {
        id,
      },
      raw: true,
    });

    if (!exist) return returnError(req, 400, "NORECORDFOUND", res);

    await psmbrcrt
      .destroy({
        where: {
          id: exist.id,
        },
        transaction: t,
      })
      .catch(async (err) => {
        console.log(err);
        await t.rollback();
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });

    //Resequence Number
    let option = {};

    option = {
      psitmcno: { [Op.gt]: exist.psitmcno },
      psmrcuid: exist.psmrcuid,
      psmbrcar: exist.psmbrcar,
    };
    let affected_record = await psmbrcrt.findAll({
      order: [["psitmcno", "asc"]],
      raw: true,
      attributes: ["id", "psitmcno"],
      where: option,
      raw: true,
    });
    console.log(affected_record);
    let err_ind = false;
    for (var i = 0; i < affected_record.length; i++) {
      console.log("WATCHMEMEM:", i, "\nKLKLKLL:", affected_record[i]);

      await psmbrcrt
        .update(
          {
            psitmcno: parseInt(affected_record[i].psitmcno) - 1,
          },
          {
            where: { id: affected_record[i].id },
            transaction: t,
          }
        )
        .catch(async (err) => {
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
};

exports.listMerchant = async (req, res) => {
  console.log("📥 /psmrcpar/listMerchant called");

  const cartId = req.user?.psmbrcar;
  if (!cartId) {
    return returnError(req, 500, "RECORDIDISREQUIRED", res);
  }

  try {
    // Get distinct merchant IDs from member's cart items
    const merchantIds = await psmbrcrt.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("psmrcuid")), "psmrcuid"],
      ],
      where: { psmbrcar: cartId },
      raw: true,
    });

    const merchantIdList = merchantIds.map((m) => m.psmrcuid);

    if (merchantIdList.length === 0) {
      return returnSuccess(200, { total: 0, data: [] }, res);
    }

    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 0;
    let offset = page * limit;

    const { count, rows } = await psmrcpar.findAndCountAll({
      limit,
      offset,
      where: {
        psmrcuid: { [Op.in]: merchantIdList },
      },
      raw: true,
      attributes: [
        ["psmrcuid", "id"],
        "psmrcuid",
        "psmrcnme",
        "psmrcdsc",
        "psmrcjdt",
        "psmrcown",
        "psmrcsts",
        "psmrcrtg",
        "psmrcsfi",
      ],
      order: [["psmrcuid", "asc"]],
    });

    const newRows = await Promise.all(
      rows.map(async (obj) => {
        const itemCount = await psmbrcrt.count({
          where: {
            psmbrcar: cartId,
            psmrcuid: obj.psmrcuid,
          },
        });
        obj.cartItemCount = itemCount;

        // Description for status
        if (!_.isEmpty(obj.psmrcsts)) {
          const desc = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psmrcsts
          );
          obj.psmrcstsdsc = desc?.prgedesc ?? "";
        }

        // Format rating and join date
        obj.psmrcrtg = await common.formatDecimal(obj.psmrcrtg);
        obj.psmrcjdt = await common.formatDate(obj.psmrcjdt, "/");

        // Resolve merchant owner username to full name
        const owner = await psusrprf.findOne({
          where: { psusrunm: obj.psmrcown },
          attributes: ["psusrnam"],
          raw: true,
        });
        obj.psmrcowndsc = owner?.psusrnam ?? "-";

        return obj;
      })
    );

    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psmrcpar", key: ["psmrcuid"] },
      },
      res
    );
  } catch (err) {
    console.error("❌ Error in listMerchant:", err);
    return returnError(req, 500, err.message || "UNEXPECTEDERROR", res);
  }
};

exports.cartItems = async (req, res) => {
  const merchantid = req.query.psmrcuid;
  const cartid = req.user?.psmbrcar;

  if (!merchantid || !cartid) {
    return returnError(req, 400, "RECORDISREQUIRED", res);
  }

  try {
    const items = await psmbrcrt.findAll({
      where: {
        psmbrcar: cartid,
        psmrcuid: merchantid,
      },
      include: [
        {
          model: psprdpar,
          as: "product",
          attributes: ["psprdnme", "psprdimg"],
        },
      ],
      attributes: ["psitmcno", "psitmqty", "psitmunt", "psitmrmk","psitmsbt"],
      raw: true,
      nest: true,
    });

    

    return returnSuccess(200, items, res);
  } catch (error) {
    console.error("Failed to retrieve cart items with product details:", error);
    return returnError(req, 500, "SERVERERROR", res);
  }
};
