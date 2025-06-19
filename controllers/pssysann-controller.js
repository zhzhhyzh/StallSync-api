// Import
const db = require("../models");
const _ = require("lodash");

// Table File
const pssysann = db.pssysann;
const psdocmas = db.psdocmas;
// Common Function
const Op = db.Sequelize.Op;
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const common = require("../common/common");
const connection = require("../common/db");
const genConfig = require("../constant/generalConfig");

// Input Validation
const validatePssysannInput = require("../validation/pssysann-validation");

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
        { pssysuid: { [Op.eq]: req.query.search } },
        { pssysuid: { [Op.like]: "%" + req.query.search + "%" } },
        { pssysttl: { [Op.eq]: req.query.search } },
        { pssysttl: { [Op.like]: "%" + req.query.search + "%" } },
      ],
    };
  }


  const { count, rows } = await pssysann.findAndCountAll({
    limit: parseInt(limit),
    offset: from,
    where: option,
    raw: true,
    attributes: [['psannuid', 'id'], 'psannuid', 'psannttl', 'psannmsg', 'psanntyp', 'psannsts', 'psanndat', 'psannimg'],
    order: [["id", "asc"]],
  });

  let newRows = [];
  for (var i = 0; i < rows.length; i++) {
    let obj = rows[i];

    if (!_.isEmpty(obj.psanntyp)) {
      let description = await common.retrieveSpecificGenCodes(req, 'ANNTYP', obj.psanntyp);
      obj.psanntypdsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
    }
    if (!_.isEmpty(obj.psannsts)) {
      let description = await common.retrieveSpecificGenCodes(req, 'YESORNO', obj.psannsts);
      obj.psannstsdsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
    }
    obj.psanndat = await common.formatDate(obj.psanndat, "/");
    newRows.push(obj);
  }

  if (count > 0)
    return returnSuccess(
      200,
      {
        total: count,
        data: newRows,
        extra: { file: "pssysann", key: ["pssysann"] },
      },
      res
    );
  else return returnSuccess(200, { total: 0, data: [] }, res);
};

exports.findOne = async (req, res) => {
  const id = req.query.id ? req.query.id : '';
  if (id == '') return returnError(req, 500, "RECORDIDISREQUIRED", res);
  pssysann.findOne({ where: { psannuid: id }, raw: true }).then(async anncde => {
    if (anncde) {
      if (!_.isEmpty(anncde.psanntyp)) {
        let description = await common.retrieveSpecificGenCodes(req, 'ANNTYP', anncde.psanntyp);
        anncde.psanntypdsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
      }
      if (!_.isEmpty(anncde.psannsts)) {
        let description = await common.retrieveSpecificGenCodes(req, 'YESORNO', anncde.psannsts);
        anncde.psannstsdsc = description.prgedesc && !_.isEmpty(description.prgedesc) ? description.prgedesc : '';
      }

      //Get original File Name
      if (anncde.psannimg != "") {
        let docmas = await psdocmas.findOne({
          where: {
            psdocfnm: anncde.psannimg
          }, raw: true,
          attributes: ["psdoconm"]
        })
        if (docmas) {
          anncde.originalName = docmas.psdoconm;
        }
      }

      return returnSuccess(200, anncde, res);
    } else return returnError(req, 500, "NORECORDFOUND", res);
  }).catch(err => {
    console.log(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  });

};

exports.create = async (req, res) => {
  //Validation
  const { errors, isValid } = validatePssysannInput(req.body, 'A');
  if (!isValid) return returnError(req, 400, errors, res);

  // Generate Code
  let code = await common.getNextRunning("ANN");
  let initial = "ANN"
  let reference = initial;
  reference += _.padStart(code, 6, '0');

  // Duplicate Check
  pssysann.findOne({
    where: {
      psannuid: reference
    }, raw: true
  }).then(async anncde => {
    if (anncde) return returnError(req, 400, { id: "RECORDEXISTS" }, res);
    else {
      const t = await connection.sequelize.transaction();
      pssysann.create({
        psannuid: reference,
        psannttl: req.body.psannttl,
        psannmsg: req.body.psannmsg,
        psanntyp: req.body.psanntyp,
        psannsts: req.body.psannsts,
        psannimg: req.body.psannimg,
        crtuser: req.user.psusrunm,
        mntuser: req.user.psusrunm
      }, { transaction: t }).then(async data => {
        let created = data.get({ plain: true });
        let errorFlag = false;
        if (created.psannimg != "") {
          // //Add Image
          await common
            .writeImage(
              genConfig.documentTempPath,
              genConfig.announcementImg,
              created.psannimg,
              // uuidv4(),
              req.user.psusrunm,
              6,
              t
            )
            .catch(async (err) => {
              console.log("Write Image Error: ", err);
              errorFlag = true;
            });
        }
        if (errorFlag) {
          await t.rollback();
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        } else {
          await t.commit();
          common.writeMntLog('pssysann', null, null, created.psannuid, 'A', req.user.psusrunm);
          return returnSuccessMessage(req, 200, "RECORDCREATED", res);
        }
      }).catch(async (err) => {
        console.log(err);
        await t.rollback();
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
    }
  }).catch(err => {
    console.log(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  });
};

exports.update = async (req, res) => {
  const id = req.body.psannuid ? req.body.psannuid : '';
  if (id == '')
    return returnError(req, 500, "RECORDIDISREQUIRED", res);

  //Validation
  const { errors, isValid } = validateSsysannInput(req.body, 'C');
  if (!isValid)
    return returnError(req, 400, errors, res);

  const psannttl = req.body.psannttl;
  const psannmsg = req.body.psannmsg;
  const psanntyp = req.body.psanntyp;
  const psannsts = req.body.psannsts;

  await pssysann.findOne({
    where: {
      psannuid: id
    }, raw: true, attributes: {
      exclude: ['createdAt', 'updatedAt', 'crtuser', 'mntuser']
    }
  }).then(async data => {
    if (data) {
      let change_img = false;
      if (data.psannimg != req.body.psannimg) {
        // Image Validation
        let img_exist = fs.existsSync(genConfig.documentTempPath + req.body.psannimg);
        if (!img_exist) return returnError(req, 400, { psannimg: "INVALIDDATAVALUE" }, res);
        change_img = true;
      }

      const t = await connection.sequelize.transaction();

      const new_sysann = {
        psannttl: psannttl,
        psannmsg: psannmsg,
        psanntyp: psanntyp,
        psannsts: psannsts,
        mntuser: req.user.psusrunm
      }

      if (change_img) new_sysann.psannimg = req.body.psannimg;

      await pssysann.update(new_sysann, {
        where: {
          id: data.id
        }, returning: true, plain: true, transaction: t
      }).then(async () => {
        let errorFlag = false;
        if (change_img) {
          if (data.psannimg != "") {



            // // Remove Old Image
            if (fs.existsSync(genConfig.announcementImagePath + data.psannimg)) {
              fs.unlinkSync(genConfig.announcementImagePath + data.psannimg);
            }

            //Remove old image from psdocmas
            await psdocmas.destroy({
              where: { psdocfnm: data.psannimg }, transaction: t
            }).catch(err => {
              console.log("Remove psdocmas Error: ", err);
              errorFlag = true;
            });
          }

          if (req.body.psannimg != "") {
            await common
              .writeImage(
                genConfig.documentTempPath,
                genConfig.announcementImagePath,
                req.body.psannimg,
                // uuidv4(),
                req.user.psusrunm,
                6,
                t
              ).catch(async (err) => {
                console.log("Write Image Error: ", err);
                errorFlag = true;
              });
          }
        }
        if (errorFlag) {
          await t.rollback();
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        } else {
          await t.commit();
          common.writeMntLog('pssysann', data, await pssysann.findByPk(data.id, { raw: true }), data.psannuid, 'C', req.user.psusrunm);
          return returnSuccessMessage(req, 200, "RECORDUPDATED", res);
        }
      }).catch(async (err) => {
        console.log(err);
        await t.rollback();
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
    }
    else return returnError(req, 500, "NORECORDFOUND", res);
  }).catch(err => {
    console.log("Error: ", err)
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  });
};

exports.delete = async (req, res) => {
  const id = req.body.id ? req.body.id : '';
  if (id == '')
    return returnError(req, 500, "RECORDIDISREQUIRED", res);

  await pssysann.findOne({
    where: {
      psannuid: id
    }, raw: true
  }).then(async anncde => {
    if (anncde) {
      const t = await connection.sequelize.transaction();
      let errorFlag = false;
      await pssysann.destroy({
        where: { id: anncde.id }, transaction: t
      }).then(async () => {
        if (anncde.psannimg != "") {
          // Remove Old Image
          if (fs.existsSync(genConfig.announcementImagePath + anncde.psannimg)) {
            fs.unlinkSync(genConfig.announcementImagePath + anncde.psannimg);
          }

          //Remove old image from psdocmas
          await psdocmas.destroy({
            where: { psdocfnm: anncde.psannimg }, transaction: t
          }).catch(err => {
            console.log("Remove psdocmas Error: ", err);
            errorFlag = true;
          });
        }

        if (errorFlag) {
          await t.rollback();
          return returnError(req, 500, "UNEXPECTEDERROR", res);
        } else {
          await t.commit();
          common.writeMntLog('pssysann', null, null, anncde.psannuid, 'D', req.user.psusrunm);
          return returnSuccessMessage(req, 200, "RECORDDELETED", res);
        }
      }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      });
    } else return returnError(req, 500, "NORECORDFOUND", res);
  }).catch(err => {
    console.log(err);
    return returnError(req, 500, "UNEXPECTEDERROR", res);
  });
};
