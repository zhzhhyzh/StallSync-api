// Import
const db = require("../models");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

// Table File
const psordpar = db.psordpar;
const psrwdpar = db.psrwdpar;
const psmbrprf = db.psmbrprf;
const psorditm = db.psorditm;
const psmbrcrt = db.psmbrcrt;
// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const general = require("../common/general");
const connection = require("../common/db");

// Input Validation
const validatePsordparInput = require("../validation/psordpar-validation.js");

exports.list = async (req, res) => {


  let limit = 10;
  if (req.query.limit) limit = req.query.limit;

  let from = 0;
  if (!req.query.page) from = 0;
  else from = parseInt(req.query.page) * parseInt(limit);




  let option = {
    [Op.and]: []
  };

  if (req.user.psusrtyp == "MCH") {
    option[Op.and].push({
      psmrcuid: req.user.psmrcuid
    })
  }

  if (req.user.psusrtyp == "MBR") {
    option[Op.and].push({
      psordpre: req.user.psusrpre,
      psordphn: req.user.psusrphn
    })
  }

  //For admin use only
  if (req.query.psmrcuid && !_.isEmpty(req.query.psmrcuid)) {
    option[Op.and].push({ psmrcuid: req.query.psmrcuid });
  }

  if (req.query.psordphn && !_.isEmpty(req.query.psordphn)) {
    option[Op.and].push({ psordphn: req.query.psordphn });
  }

  const fromDateStr = '' + req.query.from;
  const toDateStr = '' + req.query.to;

  if (!_.isEmpty(fromDateStr) || !_.isEmpty(toDateStr)) {
    let dateCondition = {};

    if (!_.isEmpty(fromDateStr)) {
      let fromDate = new Date(fromDateStr);
      if (!isNaN(fromDate.getTime())) {
        fromDate.setHours(0, 0, 0, 0);
        dateCondition[Op.gte] = fromDate;
      }
    }

    if (!_.isEmpty(toDateStr)) {
      let toDate = new Date(toDateStr);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999);
        dateCondition[Op.lte] = toDate;
      }
    }

    if (!_.isEmpty(dateCondition)) {
      option[Op.and].push({ psordodt: dateCondition });
    }
  }

  // if (req.query.from && !_.isEmpty('' + req.query.from)) {
  //   let fromDate = new Date(req.query.from);
  //   fromDate.setHours(0, 0, 0, 0);
  //   if (!_.isNaN(fromDate.getTime())) {
  //     if (req.query.to && !_.isEmpty('' + req.query.to)) {
  //       let toDate = new Date(req.query.to);
  //       toDate.setHours(23, 59, 59, 999);
  //       if (!_.isNaN(toDate.getTime())) {
  //         option.psordodt = {
  //           [Op.and]: [
  //             { [Op.gte]: fromDate },
  //             { [Op.lte]: toDate }
  //           ]
  //         }
  //       } else {
  //         option.psordodt = {
  //           [Op.gte]: fromDate
  //         }
  //       }
  //     } else {
  //       option.psordodt = {
  //         [Op.gte]: fromDate
  //       }
  //     }
  //   }
  // } else if (req.query.to && !_.isEmpty('' + req.query.to)) {
  //   let toDate = new Date(req.query.to);
  //   toDate.setHours(23, 59, 59, 999);
  //   if (!_.isNaN(toDate.getTime())) {
  //     option.psordodt = {
  //       [Op.lte]: toDate
  //     }
  //   }
  // }

  const { count, rows } = await psordpar.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [
      ["psorduid", "id"],
      "psorduid",
      "psordodt",
      "psordamt",
      "psordphn",
      "psordpre",
      "psordsts",
      "psordgra"
    ],
    order: [["psorduid", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];


    if (!_.isEmpty(obj.psordsts)) {
      let description = await common.retrieveSpecificGenCodes(
        req,
        "ODRSTS",
        obj.psordsts
      );
      obj.psordstsdsc =
        description.prgedesc && !_.isEmpty(description.prgedesc)
          ? description.prgedesc
          : "";
    }

    if (!_.isEmpty(obj.psordamt)) {
      obj.psordamt = common.formatDecimal(obj.psordamt);
    }
    if (!_.isEmpty(obj.psordgra)) {
      obj.psordgra = common.formatDecimal(obj.psordgra);
    }
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "psordpar", key: ["psorduid"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};


exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);
  psordpar
    .findOne({ where: { psorduid: id }, raw: true })
    .then(async (obj) => {
      if (obj) {
        const { count, rows } = await psorditm.findAndCountAll({
          where: {
            psorduid: id
          }
        });

        obj.psorditm = rows;
        if (!_.isEmpty(obj.psordpre)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "HPPRE",
            obj.psordpre
          );
          obj.psordpredsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psordsts)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "ODRSTS",
            obj.psordsts
          );
          obj.psordstsdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }


        if (!_.isEmpty(obj.psordrap)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psordrap
          );
          obj.psordrapdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }
        if (!_.isEmpty(obj.psordpap)) {
          let description = await common.retrieveSpecificGenCodes(
            req,
            "YESORNO",
            obj.psordpap
          );
          obj.psordpapdsc =
            description.prgedesc && !_.isEmpty(description.prgedesc)
              ? description.prgedesc
              : "";
        }

        return returnSuccess(200, obj, res);
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.create = async (req, res) => {
  //Check Authorization
  if (req.user.psusrrol == "ADM") {
    return returnError(req, 500, "INVALIDAUTHORITY", res);
  }
  let memberId = req.user.psmbruid ? req.user.psmbruid : "";
  req.body.psmbruid = memberId;
  //Validation
  const { errors, isValid } = validatePsordparInput(req.body, "A");
  if (!isValid) return returnError(req, 400, errors, res);
  let ref = uuidv4();

  let ddlErrors = {};
  let err_ind = false;
  if (!memberId && _.isEmpty(memberId)) {
    let HPPRE = await common.retrieveSpecificGenCodes(
      req,
      "HPPRE",
      req.body.psordpre
    );
    if (!HPPRE || !HPPRE.prgedesc) {
      ddlErrors.psordpre = "INVALIDDATAVALUE";
      err_ind = true;
    }

  }
  // let aff1 = await common.retrieveSpecificGenCodes(
  //   req,
  //   "ODRSTS",
  //   req.body.psordsts
  // );
  // if (!aff1 || !aff1.prgedesc) {
  //   ddlErrors.psordsts = "INVALIDDATAVALUE";
  //   err_ind = true;
  // }


  if (!_.isEmpty(req.body.psordrap)) {
    let yesorno = await common.retrieveSpecificGenCodes(
      req,
      "YESORNO",
      req.body.psordrap
    );
    if (!yesorno || !yesorno.prgedesc) {
      ddlErrors.psordrap = "INVALIDDATAVALUE";
      err_ind = true;
    }
  }
  if (!_.isEmpty(req.body.psordpap)) {
    let yesorno = await common.retrieveSpecificGenCodes(
      req,
      "YESORNO",
      req.body.psordpap
    );
    if (!yesorno || !yesorno.prgedesc) {
      ddlErrors.psordpap = "INVALIDDATAVALUE";
      err_ind = true;
    }
  }

  if (err_ind) return returnError(req, 400, ddlErrors, res);
  else {
    const t = await connection.sequelize.transaction();

    try {
      if (memberId && !_.isEmpty(memberId)) {
        let member = await psmbrprf.findOne({
          where: {
            psmbruid: memberId
          }, raw: true, attributes: ["psmbruid", "psmbrpre", "psmbrphn", "psmbrpts", "psmbracs", 'psmbrcar']
        });
        const { count, orderItem } = await psmbrcrt.findAndCountAll({
          where: {
            psmrcuid: req.body.psmrcuid,
            psmbrcar: member.psmbrcar
          }, raw: true, attributes: {
            exclude: ['createdAt', 'updatedAt']
          }

        })
        // let psorditm = req.body.psorditm;
        let orderAmount = 0;
        let grandTotal = 0;
        for (let i = 0; i < count; i++) {
          orderAmount += orderItem[i].psitmsbt;
        }
        grandTotal = orderAmount;

        //Rewards Using and Updates
        if (req.body.psordrap == "Y") {

          let reward = await psrwdpar.findOne({
            where: {
              psrwduid: req.body.psrwduid,
              psrwduid: "A"
            }, raw: true, attributes: ["psrwduid", "psrwdtyp", "psrwddva", "psrwdism", "psrwdmin", "psrwdcap", "psrwdaam", "psrwdqty"]
          });

          if (!reward || _.isEmpty(reward.psrwduid)) {
            return returnError(req, 400, "INVALIDVOUCHER", res);
          }

          let claim = await psordpar.findOne({
            where: {
              psmbruid: memberId,
              psordsts: 'D',
              psrwduid: req.body.psrwduid
            }, raw: true, attributes: ["psorduid"]
          });
          if (claim || _.isEmpty(claim.psorduid)) {
            return returnError(req, 400, "VOUCHERPREVCLAIMED", res);

          }
          if (reward.psrwdaam == 'N') {
            let merchantAvailable = await psrwddtl.findOne({
              where: {
                psrwduid: req.body.psrwduid,
                psmrcuid: req.body.psmrcuid
              }, raw: true, attributes: ['psrwduid', 'psmrcuid']
            });

            if (!merchantAvailable || _.isEmpty(merchantAvailable.psmrcuid)) {
              return returnError(req, 400, "CONDITIONNOTMET", res);
            }
          }

          if (reward.psrwdism == 'Y') {
            if (orderAmount < reward.psrwdmin) {
              return returnError(req, 400, "CONDITIONNOTMET", res);
            }
          }

          switch (reward.psrwdtyp) {
            case 'P':
              let discountValue = grandTotal * reward.psrwddva;
              if (reward.psrwdica == 'Y') {
                if (discountValue > reward.psrwdcap && reward.psrwdcap != 0) {
                  discountValue = reward.psrwdcap;
                }
              }
              grandTotal -= discountValue;
              break;
            case 'V':
              let discount = reward.psrwddva;
              if (reward.psrwdica == 'Y') {
                if (discount > reward.psrwdcap && reward.psrwdcap != 0) {
                  discount = reward.psrwdcap;
                }
              }
              grandTotal -= discount;
              break;
          }

          //Update quantity
          let rewardStatus = "A"
          if (reward.psrwdqty == 1) {
            rewardStatus = "O"
          }
          await psrwdpar.update({
            psrwdqty: reward.psrwdqty - 1,
            psrwdsts: rewardStatus
          }, {
            where: {
              psrwduid: reward.psrwduid
            }
          })
        }

        let pointValue = 0.00;
        let balancePoint = 0;

        //Points Using and updates
        if (req.body.psordpap == 'Y' && memberId) {
          let mPoint = req.user.psmbrpts;
          pointValue = mPoint / 100;
          if (pointValue > grandTotal) {
            balancePoint = (pointValue - grandTotal) * 100;
            grandTotal = 0;
          } else {
            grandTotal -= pointValue;
          }

          await psmbrprf.update({ psmbrpts: pointValue, psmbracs: member.psmbracs + grandTotal }, {
            where: {
              psmbruid: memberId
            }
          });

        }

        //SST Add on
        let sst = 0;
        sst = grandTotal * 0.06;
        grandTotal -= sst;

        psordpar
          .create({
            psorduid: ref,
            psordrap: req.body.psordrap,
            psordpap: req.body.psordpap,
            psordpdv: balancePoint,
            psordodt: new Date(),
            psordamt: orderAmount,
            psrwduid: req.body.psordrap == "Y" ? req.body.psrwduid : "",
            psordgra: grandTotal,
            psmbruid: memberId,
            psordpre: memberId ? member.psmbrpre : req.body.psordpre,
            psordphn: memberId ? member.psmbrphn : req.body.psordphn,
            psmrcuid: req.body.psmrcuid,
            psordsts: 'N',
            psordocd: '',
            psordsst: sst
          })
          .then(async (data) => {
            let created = data.get({ plain: true });
            for (let i = 0; i < count; i++) {

              await psorditm.create({
                psorduid: ref,
                psprduid: orderItem[i].psprduid,
                psitmcno: orderItem[i].psitmcno,
                psitmqty: orderItem[i].psitmqty,
                psitmarm: orderItem[i].psitmarm,
                psitmdsc: orderItem[i].psitmdsc,
                psitmrmk: orderItem[i].psitmrmk,
                psitmsbt: orderItem[i].psitmsbt,
                psitmunt: orderItem[i].psitmunt,
              })
            }

            common.writeMntLog(
              "psordpar",
              null,
              null,
              created.psordpar,
              "A",
              req.user.psusrunm,
              "", created.psordpar);
            return returnSuccessMessage(req, 200, "RECORDCREATED", res);
          })
      } else if ((req.body.psordpap == 'Y' || req.body.psordpap == 'Y') && !memberId) {
        return returnError(req, 400, 'NOTAMEMBER', res);
      }


    } catch (err) {
      console.log(err);
      await t.rollback();
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
  }

};

exports.update_paid = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psordpar
    .findOne({
      where: {
        psordpar: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)
        if (data.psordsts != 'G')
          psordpar
            .update(
              {
                psordsts: 'P'
              },
              {
                where: {
                  id: data.id,
                },
              }
            )
            .then(async () => {
              common.writeMntLog(
                "psordpar",
                data,
                await psordpar.findByPk(data.id, { raw: true }),
                data.psordpar,
                "C",
                req.user.psusrunm
              );
              return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
            });
        else {
          console.log("Pre status must be G - Pending")
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

exports.update_completed = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psordpar
    .findOne({
      where: {
        psordpar: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        const t = await connection.sequelize.transaction();
        try {
          if (data.psordsts != 'A') {
            if (data.psmbruid != '' && !_.isEmpty(data.psmbruid)) {

              let member = await psmbrprf.findOne({
                where: {
                  psmbruid: data.psmbruid
                }, raw: true, attributes: ['psmbruid', 'psmbrtyp', 'psmbrexp', 'psmbracs']
              })
              let memberType = 'B';

              if (member) {
                // Add 1 year to current expiry date
                const newExpiry = new Date(member.psmbrexp);
                newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                if (member.psmbracs > 500) {
                  memberType = 'S';
                } else if (member.psmbracs > 1000) {
                  memberType = 'G';

                }

                // Update the expiry date
                await psmbrprf.update(
                  {
                    psmbrexp: newExpiry,
                    psmbrtyp: memberType
                  },
                  {
                    where: {
                      psmbruid: data.psmbruid
                    }
                  }
                );
              }
            }
            psordpar
              .update(
                {
                  psordsts: 'D'
                },
                {
                  where: {
                    id: data.id,
                  },
                }
              )
              .then(async () => {
                common.writeMntLog(
                  "psordpar",
                  data,
                  await psordpar.findByPk(data.id, { raw: true }),
                  data.psordpar,
                  "C",
                  req.user.psusrunm
                );
                return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
              });
          } else {
            console.log("Pre status must be A - Preparing")
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);

          }

        } catch (err) {
          console.log(err);
          await t.rollback();
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};


exports.update_preparing = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psordpar
    .findOne({
      where: {
        psordpar: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)

        if (data.psordsts != 'P')

          psordpar
            .update(
              {
                psordsts: 'A'
              },
              {
                where: {
                  id: data.id,
                },
              }
            )
            .then(async () => {
              common.writeMntLog(
                "psordpar",
                data,
                await psordpar.findByPk(data.id, { raw: true }),
                data.psordpar,
                "C",
                req.user.psusrunm
              );
              return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
            });
        else {
          console.log("Pre status must be P - Paid");
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};


exports.update_cancelled = async (req, res) => {
  const id = req.body.id ? req.body.id : "";
  if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await psordpar
    .findOne({
      where: {
        psordpar: id,
      },
      raw: true,
      attributes: {
        exclude: ["createdAt", "crtuser", "mntuser"],
      },
    })
    .then(async (data) => {
      if (data) {
        if (isNaN(new Date(req.body.updatedAt)) || (new Date(data.updatedAt).getTime() !== new Date(req.body.updatedAt).getTime())) return returnError(req, 500, "RECORDOUTOFSYNC", res)
        const t = await connection.sequelize.transaction();
        try {
          if (data.psordsts == 'A' || data.psordsts == 'D') {
            if (data.psmbruid != '' && !_.isEmpty(data.psmbruid)) {
              let reward = await psrwdpar.findOne({
                where: {
                  psrwduid: data.psrwduid
                }, raw: true, attributes: ['psrwduid', 'psrwdqty', 'psrwdsts']
              });
              let rewardStatus = reward.psrwdsts != 'P' ? 'A' : 'P';
              await psrwdpar.update({
                where: {
                  psrwdqty: reward.psrwdqty + 1,
                  psrwdsts: rewardStatus

                }
              }, {
                where: {
                  psrwduid: data.psrwduid
                }
              });

              let dva = data.psorddva ? data.psorddva : 0;

              let member = await psmbrprf.findOne({
                where: {
                  psmbruid: data.psmbruid
                }, raw: true, attributes: ['psmbruid', 'psmbracs', 'psmbrpts']
              })
              await psmbrprf.update({
                psmbracs: member.psmbracs - data.psordgra,
                psmbrpts: member.psmbrpts + (dva / 100)
              }, {
                where: {
                  psmrbuid: data.psmbruid
                }
              });
            }

            psordpar
              .update(
                {
                  psordsts: 'C'
                },
                {
                  where: {
                    id: data.id,
                  },
                }
              )
              .then(async () => {
                common.writeMntLog(
                  "psordpar",
                  data,
                  await psordpar.findByPk(data.id, { raw: true }),
                  data.psordpar,
                  "C",
                  req.user.psusrunm
                );
                return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
              });
          } else {
            console.log("Pre status can't be A - Preparing OR D - Completed");
            await t.rollback();
            return returnError(req, 500, "UNEXPECTEDERROR", res);
          }
        } catch (err) {
          console.log(err);
          await t.rollback();
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        }
      } else return returnError(req, 500, "NORECORDFOUND", res);
    })
    .catch((err) => {
      console.log(err);
      return returnError(req, 500, "UNEXPECTEDERROR", res);
    });
};

// exports.delete = async (req, res) => {
//   const id = req.body.id ? req.body.id : "";
//   if (id == "") return returnError(req, 500, "RECORDIDISREQUIRED", res);

//   await psordpar
//     .findOne({
//       where: {
//         psordpar: id,
//       },
//       raw: true,
//     })
//     .then((trnscd) => {
//       if (trnscd) {
//         psordpar
//           .destroy({
//             where: { id: trnscd.id },
//           })
//           .then(() => {
//             common.writeMntLog(
//               "psordpar",
//               null,
//               null,
//               trnscd.psordpar,
//               "D",
//               req.user.psusrunm,
//               "",
//               trnscd.psordpar
//             );
//             return returnSuccessMessage(req, 200, "RECORDDELETED", res);
//           })
//           .catch((err) => {
//             console.log(err);
//             return returnError(req, 500, "UNEXPECTEDERROR", res);
//           });
//       } else return returnError(req, 500, "NORECORDFOUND", res);
//     })
//     .catch((err) => {
//       console.log(err);
//       return returnError(req, 500, "UNEXPECTEDERROR", res);
//     });
// };
