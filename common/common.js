const db = require("../models");
const _ = require("lodash");
const multer = require("multer");
const { parse } = require("csv-parse");
const pathModule = require('path');
const fs = require("fs");
const fsP = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const moment = require("moment");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const path = require("path");

const mntlogpf = db.mntlogpf;
const prgentyp = db.prgentyp;
const prgencde = db.prgencde;
const pssyspar = db.pssyspar;
const syrnsqpf = db.syrnsqpf;
const psdocmas = db.psdocmas;
const prrpthis = db.prrpthis;

const rc = require("./redis");

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
    prgentyp.findOne({
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
  subCategory
) {
  try {
    if (action == "C") {
      Object.keys(oldData).forEach((key) => {
        if (JSON.stringify(oldData[key]) != JSON.stringify(newData[key])) {
          let newMntLog = {
            prmntfile: file,
            prmntkey: mntKey,
            prfieldnme: key,
            prfldolddta: oldData[key] || oldData[key] === 0 ? "" + oldData[key] : "",
            prfldnewdta: newData[key] || newData[key] === 0 ? "" + newData[key] : "",
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
        prfieldnme: "-",
        prfldnewdta: subCategory + " - " + newData,
        praction: action.substring(0, 1),
        prmntusr: user,
      };
      mntlogpf.create(newMntLog);
    } else {
      let newMntLog = {
        prmntfile: file,
        prmntkey: mntKey,
        prfieldnme: "-",
        prfldnewdta: "-",
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

async function formatDate(value, separator) {
  return new Promise((resolve, reject) => {
    try {
      let date = new Date(value);
      if (date && !isNaN(date.getTime()))
        return resolve(
          _.padStart(
            _.padStart(date.getDate(), 2, "0") +
            separator +
            _.padStart(date.getMonth() + 1, 2, "0") +
            separator +
            date.getFullYear(),
            2,
            "0"
          )
        );
      else return resolve("");
    } catch (err) {
      return resolve(value);
    }
  });
}

async function formatDateTime(value, type, dateformat) {
  return new Promise((resolve, reject) => {
    try {
      let date = new Date(value);
      if (date && !isNaN(date.getTime())) {
        let format = "DD-MM-YYYY ";
        if (type == "12") format += "hh";
        else format += "HH";
        format += ":mm:ss A";

        if (dateformat && dateformat !== "") {
          format = dateformat;
        }
        return resolve(moment(value).format(format));
      } else return resolve("");
    } catch (err) {
      return resolve(value);
    }
  });
}

async function getSysPar() {
  return new Promise(async (resolve, reject) => {
    let syspar = await pssyspar.findOne({ raw: true });
    if (!syspar) return resolve(false);
    else return resolve(syspar);
  });
}

async function redisGet(key) {
  return new Promise(async (resolve, reject) => {
    if (rc.connected) {
      await rc.get(key, (err, val) => {
        if (err) return reject(err);
        if (val == null) return resolve("");
        try {
          resolve(JSON.parse(val));
        } catch (err) {
          resolve(val);
        }
      });
    } else return resolve("");
  });
}

async function redisSet(key, value) {
  return new Promise(async (resolve, reject) => {
    if (rc.connected) {
      await rc.set(key, value);
      return resolve("");
    } else return resolve("");
  });
}

async function retrieveGenCodes(req, gentype, direction) {
  return new Promise((resolve, reject) => {
    prgentyp
      .findOne({
        where: { prgtycde: gentype },
        raw: true,
        attributes: ["id"],
      })
      .then(async (typ) => {
        if (typ) {
          let option = {
            where: {
              prgtycde: gentype,
            },
            raw: true,
            attributes: ["prgecode", "prgedesc", "prgeldes"],
          };
          if (!_.isEmpty(direction)) option.order = [["prgedesc", direction]];

          await prgencde.findAll(option).then((cde) => {
            if (cde) {
              for (var i = 0; i < cde.length; i++) {
                let obj = cde[i];
                if (
                  req.headers &&
                  req.headers["locale"] &&
                  req.headers["locale"].toLowerCase() == "zh"
                )
                  obj.prgedesc = obj.prgeldes;
                else obj.prgedesc = obj.prgedesc;
              }
              resolve(cde);
            } else resolve("");
          });
        } else resolve("");
      });
  });
}

async function getNextRunning(type) {
  return new Promise((resolve, reject) => {
    syrnsqpf
      .findOne({
        where: {
          type: type,
        },
        raw: true,
      })
      .then(async (rnsq) => {
        if (rnsq) {
          let runsq = parseInt(rnsq.current) + 1;
          await syrnsqpf.update(
            {
              current: runsq,
            },
            {
              where: {
                id: rnsq.id,
              },
            }
          );
          return resolve(runsq);
        } else {
          await syrnsqpf.create({
            type: type,
            current: 1,
          });
          return resolve(1);
        }
      });
  });
}

async function formatDecimal(value) {
  return new Promise(async (resolve, reject) => {
    try {
      value = value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return resolve(value);
    } catch (err) {
      return reject(err);
    }
  });
}

async function writeImage(from, to, filename /*, org_filename*/, user, type, trans) {
  return new Promise(async (resolve, reject) => {
    try {
      // Get File Object
      let docmas = await psdocmas.findOne({
        where: {
          psdocfnm: filename
        }, raw: true, transaction: trans
      });
      if (!docmas) return reject("DOCUMENTNOTFOUND");

      // Find File
      let exists = fs.existsSync(from + "/" + filename);
      if (exists) {
        // Move File
        // await file_common.uploadS3Object(docmasm, to);
        fs.renameSync(from + "/" + filename, to + "/" + filename);


        // error, "then" is undefined
        // .then(
        // async () => {
        // Write Data
        await psdocmas
          .update(
            {
              // psdocfnm: filename,
              // psdoconm: org_filename,
              psdoctyp: type,
              crtuser: user,
              mntuser: user,
            },
            { where: { psdocfnm: filename }, transaction: trans }
          )
          .then(() => {
            return resolve(true);
          })
          .catch((err) => {
            console.log("Error Writing Image", err);
            return reject(err);
          });
        // }
        // );
      } else return reject("FILENOTFOUND");
    } catch (err) {
      console.log("Error Writing Image", err);
      return reject(err);
    }
  });
}

async function getAPI(url, body, header, caller, callerType, no_log) {
  return new Promise(async (resolve, reject) => {
    // Write Outgoing Log
    let ref = "";
    logging("ROUTING", "Request [" + new Date().toLocaleString() + "] GET :" + url);
    if (!no_log) {
      ref = await writeLog(
        "hostname",
        url,
        caller,
        callerType,
        "C",
        body, header
      ).catch(async (err) => {
        //Write Log Error
        logging("ERR", err);
        return false;
      });
    }

    // Trigger Post Request
    await axios
      .get(url, {
        headers: header,
        params: body,
      })
      .then(async (response) => {
        response = response.data;
        // Write Response Log
        if (ref && !no_log)
          await updateLog(
            response.Status,
            ref,
            response.Result
              ? JSON.stringify(response.Result)
              : response.data
                ? JSON.stringify(response.data)
                : JSON.stringify(response),
            response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
            response.Errors ? response.Errors : "",
            "C"
          );
        logging("ROUTING", "Response [" + new Date().toLocaleString() + "] GET :" + url);
        return resolve(response);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}

async function postAPI(url, body, header, caller, callerType, method) {
  return new Promise(async (resolve, reject) => {
    let api_mode = "POST";
    if (method && method == 'U') api_mode = 'PUT';
    else if (method && method == 'D') api_mode = 'DELETE';
    else if (method && method == 'A') api_mode = 'PATCH';

    // Write Outgoing Log
    let ref = await writeLog(
      "hostname",
      url,
      caller,
      callerType,
      "C",
      body, header, api_mode
    ).catch(async (err) => {
      //Write Log Error
      logging("ERR", err);
      return false;
    });
    if (method && method != "") {
      if (method == "U") {
        logging("ROUTING", "Request [" + new Date().toLocaleString() + "] Put :" + url);
        // Put Request
        await axios
          .put(url, body, {
            headers: header
              ? header
              : {
                "Content-Type": "application/json",
                instanceId: instanceId,
                instanceKey: instanceKey,
              },
          })
          .then(async (response) => {
            let status = response.Status ? response.Status : response.status ? response.status : "";
            response = response.data;
            // Write Response Log
            if (ref)
              await writeResponseLog(ref, url, response.Result
                ? JSON.stringify(response.Result)
                : response.data
                  ? JSON.stringify(response.data)
                  : "",
                status,
                response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
                response.Errors ? response.Errors : "",
                "C", caller, callerType, header, "PUT"
              );
            logging("ROUTING", "Response [" + new Date().toLocaleString() + "] Put :" + url);
            return resolve(response);
          })
          .catch(async (err) => {
            if (ref)
              await writeResponseLog(ref, url, response.Result
                ? JSON.stringify(response.Result)
                : response.data
                  ? JSON.stringify(response.data)
                  : "",
                response.Status,
                response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
                response.Errors ? response.Errors : "",
                "C", caller, callerType, header, "PUT"
              );
            logging("ROUTING", "Error [" + new Date().toLocaleString() + "] Put :" + url);
            return reject(err);
          });
      } else if (method == "A") {
        logging("ROUTING", "Request [" + new Date().toLocaleString() + "] Patch :" + url);
        // Patch Request
        await axios
          .patch(url, body, {
            headers: header
              ? header
              : {
                "Content-Type": "application/json",
                instanceId: instanceId,
                instanceKey: instanceKey,
              },
          })
          .then(async (response) => {
            let status = response.Status ? response.Status : response.status ? response.status : "";

            response = response.data;
            // Write Response Log
            if (ref)
              await writeResponseLog(ref, url, response.Result
                ? JSON.stringify(response.Result)
                : response.data
                  ? JSON.stringify(response.data)
                  : "",
                status,
                response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
                response.Errors ? response.Errors : "",
                "C", caller, callerType, header, "PATCH"
              );
            logging("ROUTING", "Response [" + new Date().toLocaleString() + "] Patch :" + url);
            return resolve(response);
          })
          .catch(async (err) => {
            if (ref)
              await updateLog(
                err.response.Status,
                ref,
                err.response.Result
                  ? JSON.stringify(err.response.Result)
                  : err.response.data
                    ? JSON.stringify(err.response.data)
                    : "",
                err.response.Errors && err.response.Errors.length > 0
                  ? "APIERROR"
                  : "",
                err.response.Errors ? err.response.Errors : "",
                "C"
              );
            logging("ROUTING", "Error [" + new Date().toLocaleString() + "] Patch :" + url);
            return reject(err);
          });
      } else if (method == "D") {
        logging("ROUTING", "Request [" + new Date().toLocaleString() + "] Delete :" + url);
        // Delete Request
        await axios
          .delete(url, {
            headers: header
              ? header
              : {
                "Content-Type": "application/json",
                instanceId: instanceId,
                instanceKey: instanceKey,
              },
          })
          .then(async (response) => {
            let status = response.Status ? response.Status : response.status ? response.status : "";

            response = response.data;
            // Write Response Log
            if (ref)
              await writeResponseLog(ref, url, response.Result
                ? JSON.stringify(response.Result)
                : response.data
                  ? JSON.stringify(response.data)
                  : "",
                status,
                response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
                response.Errors ? response.Errors : "",
                "C", caller, callerType, header, "DELETE"
              );

            logging("ROUTING", "Response [" + new Date().toLocaleString() + "] Delete :" + url);
            return resolve(true);
          })
          .catch(async (err) => {
            logging("ROUTING", "Error [" + new Date().toLocaleString() + "] Delete :" + url);
            return reject(err);
          });
      } else return reject("INVALIDMETHOD");
    } else {
      logging("ROUTING", "Request [" + new Date().toLocaleString() + "] Post :" + url);
      // Trigger Post Request
      await axios
        .post(url, body, {
          headers: header
            ? header
            : {
              "Content-Type": "application/json",
              instanceId: instanceId,
              instanceKey: instanceKey,
            },
        })
        .then(async (response) => {
          let status = response.Status ? response.Status : response.status ? response.status : "";

          response = response.data;
          // Write Response Log
          if (ref)
            await writeResponseLog(ref, url, response.Result
              ? JSON.stringify(response.Result)
              : response.data
                ? JSON.stringify(response.data)
                : "",
              status,
              response.Errors && response.Errors.length > 0 ? "APIERROR" : "",
              response.Errors ? response.Errors : "",
              "C", caller, callerType, header, "POST"
            );

          logging("ROUTING", "Response [" + new Date().toLocaleString() + "] Post :" + url);
          return resolve(response);
        })
        .catch(async (err) => {
          if (ref)
            await updateLog(
              err.response.Status ? err.response.Status : "500",
              ref,
              err.response.Result
                ? JSON.stringify(err.response.Result)
                : err.response.data
                  ? JSON.stringify(err.response.data)
                  : "",
              err.response.Errors && err.response.Errors.length > 0
                ? "APIERROR"
                : "",
              err.response.Errors ? err.response.Errors : "",
              "C"
            );
          logging("ROUTING", "Error [" + new Date().toLocaleString() + "] POST :" + url);
          return reject(err);
        });
    }
  });
}

async function writeLog(hostname, url, caller, party, type, body, header, mode) {
  return new Promise(async (resolve, reject) => {
    let ref = uuidv4();
    try {
      routelog
        .create({
          logrefnm: ref,
          // logapidm: hostname,
          logapinm: url,
          logerrcd: "",
          logerrds: "",
          logheadr: JSON.stringify(header),
          logincom: type == "T" ? JSON.stringify(body) : "",
          logoutgg: type == "T" ? "" : JSON.stringify(body),
          logcallr: caller && !_.isEmpty(caller) ? caller : "",
          logparty: party,
          logctype: type,
          logamode: mode ? mode : "GET",
          logatype: "OUTGOING"
        })
        .then(() => {
          return resolve(ref);
        })
        .catch(async (err) => {
          console.log("Write Log Error", err);
          logging("ERR", err);
          return reject(err);
        });
    } catch (err) {
      return reject(err);
    }
  });
}

async function compareObject(obj1, obj2) {
  return new Promise((resolve, reject) => {
    Object.keys(obj1).forEach((key) => {
      if (JSON.stringify("" + obj1[key]) != JSON.stringify("" + obj2[key])) {
        return resolve(false);
      }
    });
    return resolve(true);
  }).catch((err) => {
    console.log(err);
    return reject(err);
  });
}

async function writeReport(
  req,
  header,
  data,
  rpthis,
  filename,
  type,
  date,
  format = "CSV" // default to CSV
) {
  return new Promise(async (resolve, reject) => {
    const path = RPTPath + filename;
    if (!fs.existsSync(RPTPath)) {
      fs.mkdirSync(RPTPath, { recursive: true });
    }


    if (format === "CSV") {
      const csvWriter = createCsvWriter({
        path: path,
        header: header,
        alwaysQuote: true,
      });

      try {
        await csvWriter.writeRecords(data);
        appendStart(req, filename, date, type);
        await prrpthis.update(
          { prrptsts: "C" },
          { where: { id: rpthis.id } }
        );

        resolve("");
      } catch (err) {
        console.error("writeReport CSV error:", err);

        await prrpthis.update(
          { prrptsts: "E" },
          { where: { id: rpthis.id } }
        );

        reject(err);
      }
    } else {
      console.warn("Unsupported format:", format);
      reject(new Error("Unsupported format: " + format));
    }
  });
}
async function appendStart(req, filename, date, type, deliveryType = "") {
  try {
    const rpt = await prrpthis.findOne({
      where: { prrptnme: filename },
      raw: true,
    });

    if (!rpt) throw new Error("Report record not found");

    const filePath = path.join(RPTPath, filename);

    const firstLine = rpt.prrpttyp ? `${rpt.prrpttyp}\n` : "";

    let secondLinePrefix = "";
    if (type === "M") secondLinePrefix = "Month: ";
    else if (type === "Y") secondLinePrefix = "Year: ";
    else if (type === "T") secondLinePrefix = "Quarter: ";

    const secondLine = date ? `${secondLinePrefix}${date}\n` : "";

    const fileContent = await fsP.readFile(filePath, "utf8"); //  No error here
    const newContent = `${firstLine}${secondLine}${fileContent}`;

    await fsP.writeFile(filePath, newContent, "utf8"); //  Proper write

  } catch (err) {
    console.error(`Error in appendStart() for: ${filename}`, err);
    throw err;
  }
}

async function convertDate(date) {
  return new Promise((resolve, reject) => {
    if (!date) return resolve("");
    try {
      let new_date = new Date(date);
      console.log(new_date);
      let dd = String(new_date.getDate()).padStart(2, "0");
      var mm = String(new_date.getMonth() + 1).padStart(2, "0");
      var yyyy = new_date.getFullYear();
      let hh = String(new_date.getHours()).padStart(2, "0");
      let mn = String(new_date.getMinutes()).padStart(2, "0");

      let formatted = dd + "/" + mm + "/" + yyyy + " " + hh + ":" + mn;
      return resolve(formatted);
    } catch (ex) {
      console.log(ex);
      return resolve("");
    }
  });
}

module.exports = {
  logging,
  retrieveSpecificGenCodes,
  writeMntLog,
  formatDate,
  formatDateTime,
  getSysPar,
  redisGet,
  redisSet,
  retrieveGenCodes,
  getNextRunning,
  formatDecimal,
  writeImage,
  getAPI,
  postAPI,
  writeLog,
  compareObject,
  writeReport,
  convertDate,
  appendStart,
}
