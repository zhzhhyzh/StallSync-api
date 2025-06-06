const db = require("../models");
const _ = require("lodash");
const multer = require("multer");
const { parse } = require("csv-parse");

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require("moment");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fsP = require("fs/promises");
const path = require("path");

const generalConfig = require("../constant/generalConfig.js");
const sequelize = require("sequelize");

const RPTPath = generalConfig.reportPath;

async function logging(type, message) {
  return new Promise(async (resolve, reject) => {
    try {
      let logpar = await getLogPar(type);
      if (logpar) {
        let exist = fs.existsSync(logpar.path);
        if (!exist) fs.mkdirSync(logpar.path);

        exist = fs.existsSync(logpar.path + logpar.name + ".log");
        if (exist) {
          // Check Size
          let prop = fs.statSync(logpar.path + logpar.name + ".log");
          let sizeByte = logpar.size * 1024 * 1024;

          if (prop.size > sizeByte) {
            // File Name
            let running = 1;
            let filename =
              logpar.path +
              logpar.name +
              "-" +
              (await formatDate(new Date(), "_"));

            while (fs.existsSync(filename + running + ".log")) {
              running++;
            }
            if (running == 1) filename = filename.split("_" + running)[0];
            else filename = filename + running;

            // Backup File
            fs.copyFileSync(logpar.path + logpar.name + ".log", filename + ".log");
            // Wipe File
            fs.unlinkSync(logpar.path + logpar.name + ".log");
            // Write Log File
            fs.writeFileSync(logpar.path + logpar.name + ".log", message);
          } else {
            fs.appendFileSync(
              logpar.path + logpar.name + ".log",
              message + "\n"
            );
          }
        } else {
          fs.writeFileSync(logpar.path + logpar.name + ".log", message + "\n");
        }
      } else return resolve(false);
    } catch (err) {
      return reject(err);
    }
  });
}

async function retrieveSpecificGenCodes(req, gentype, gencode) {
  return new Promise((resolve, reject) => {
    prgentyp
      .findOne({
        where: { prgtycde: gentype },
        raw: true,
        attributes: ["id"],
      })
      .then(async (typ) => {
        if (typ) {
          await prgencde
            .findOne({
              where: {
                prgtycde: gentype,
                prgecode: gencode,
              },
              raw: true,
              attributes: ["prgedesc", "prgeldes"],
            })
            .then((cde) => {
              if (cde) {
                if (
                  req &&
                  req.headers &&
                  req.headers["locale"] &&
                  req.headers["locale"].toLowerCase() == "zh"
                )
                  cde.prgedesc = cde.prgeldes;
                else cde.prgedesc = cde.prgedesc;
                resolve(cde);
              } else resolve("");
            });
        } else resolve("");
      });
  });
}

async function writeMntLog(
  file,
  oldData,
  newData,
  mntKey,
  action,
  user,
  subCategory,
  recordKey
) {
  try {
    if (action == "C") {
      Object.keys(oldData).forEach((key) => {
        if (key !== "updatedAt") {
          if (JSON.stringify(oldData[key]) != JSON.stringify(newData[key])) {
            let newMntLog = {
              prmntfile: file,
              prmntkey: mntKey,
              prfieldnme: key,
              prfldolddta: oldData[key] ? "" + oldData[key] : "",
              prfldnewdta: newData[key] ? "" + newData[key] : "",
              praction: action,
              prmntusr: user,
            };

            mntlogpf.create(newMntLog);
          }
        }
      });
    } else if (action == "CS") {
      Object.keys(oldData).forEach((key) => {
        if (JSON.stringify(oldData[key]) != JSON.stringify(newData[key])) {
          let newMntLog = {
            prmntfile: file,
            prmntkey: mntKey,
            prfieldnme: key,
            prfldolddta: oldData[key] ? "" + oldData[key] : "",
            prfldnewdta: newData[key] ? "" + newData[key] : "",
            praction: action,
            prmntusr: user,
          };

          mntlogpf.create(newMntLog);
        }
      });
    } else if (action == "AS" || action == "DS") {
      let newMntLog = {
        prmntfile: file,
        prmntkey: mntKey,
        // prfieldnme: "-",
        // prfldnewdta: subCategory + " - " + newData,
        prfieldnme: subCategory,
        prfldnewdta: newData,
        praction: action.substring(0, 1),
        prmntusr: user,
      };
      mntlogpf.create(newMntLog);
    } else {
      let newMntLog = {
        prmntfile: file,
        prmntkey: mntKey,
        prfieldnme: action == "D" ? recordKey : "-",
        prfldnewdta: action == "A" ? recordKey : "-",
        praction: action,
        prmntusr: user,
      };
      mntlogpf.create(newMntLog);
    }
  } catch (err) {
    console.log(err);
    console.log("File: ", file);
    console.log("oldData: ", oldData);
    console.log("newData: ", newData);
    console.log("mntKey: ", mntKey);
    console.log("action: ", action);
    console.log("user: ", user);
    console.log("subCategory: ", subCategory);
  }
}

module.exports = {
    logging,
    retrieveSpecificGenCodes,
    writeMntLog
}
