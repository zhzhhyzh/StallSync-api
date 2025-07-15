const cron = require("node-cron");
const exec = require("child_process").exec;
const _ = require("lodash");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { spawn } = require("child_process");
const path2 = require("path");
const db = require("../models");
const Op = db.Sequelize.Op;
const psmbrprf = db.psmbrprf;
const pssysjob = db.pssysjob;

const psrwdpar = db.psrwdpar;
const psprdpar = db.psprdpar;
const psordrvw = db.psordrvw;
const psordpar = db.psordpar;
const psorditm = db.psorditm;
const pstrxpar = db.pstrxpar;

// Common
const common = require("../common/common");
const general = require("../common/general");

async function voucher_expiry() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Voucher Expiry -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      // Find All Voucher (Member)
      let vouchers = await psrwdpar.findAll({
        where: {
          [Op.and]: [
            {
              psrwdsts: {
                [Op.or]: ["A", "O"],
              },
            },
            {
              psrwdtdt: {
                [Op.lte]: today,
              },
            },
          ],
        },
        raw: true,
      });

      for (var i = 0; i < vouchers.length; i++) {
        let vch = vouchers[i];

        // Set Voucher to Expired
        await psrwdpar.update(
          {
            psrwdsts: "P",
          },
          {
            where: {
              psrwduid: vch.psrwduid,
            },
          }
        );
      }

      console.log("Voucher Expiry -- End");

      pssysjob.create({
        psjobcde: "VEXPIRY",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Voucher Expiry Error ", err);
      pssysjob.create({
        psjobcde: "VEXPIRY",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}

async function member_expiry() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Member Expiry -- Start");
      let start = new Date();
      let today = new Date(start);
      let oneYearFromNow = today.setFullYear(today.getFullYear() + 1);
      today.setHours(0, 0, 0, 0);
      // Find All Voucher (Member)
      let members = await psmbrprf.findAll({
        where: {
          [Op.and]: [
            {
              psmbrexp: {
                [Op.lte]: today,
              },
            },
          ],
        },
        raw: true,
      });

      for (var i = 0; i < members.length; i++) {
        let mbr = members[i];
        let status = mbr.psmbrtyp == "G" ? "S" : "B";
        // Set Voucher to Expired
        await psmbrprf.update(
          {
            psmbrtyp: status,
            psmbrexp: oneYearFromNow,
          },
          {
            where: {
              id: mbr.id,
            },
          }
        );
      }

      console.log("Member Expiry -- End");

      pssysjob.create({
        psjobcde: "MEXPIRY",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Voucher Expiry Error ", err);
      pssysjob.create({
        psjobcde: "MEXPIRY",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}

async function voucher_activate() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Voucher Expiry -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      // Find All Voucher (Member)
      let vouchers = await psrwdpar.findAll({
        where: {
          psrwdsts: "I",

          psrwdfdt: {
            [Op.lte]: today,
          },
          psrwdtdt: {
            [Op.gte]: today,
          },
        },
        raw: true,
      });

      for (var i = 0; i < vouchers.length; i++) {
        let vch = vouchers[i];
        // Set Voucher to Expired
        await psrwdpar.update(
          {
            psrwdsts: "A",
          },
          {
            where: {
              psrwduid: vch.psrwduid,
            },
          }
        );
      }

      console.log("Voucher Expiry -- End");

      pssysjob.create({
        psjobcde: "VACTIVE",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Voucher Expiry Error ", err);
      pssysjob.create({
        psjobcde: "VACTIVE",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}

async function recommendationGet() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Voucher Expiry -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      // Generate food csv (name, Product_ID,price, merchant, image, rating)
      let product = await psprdpar.findAll({
        raw: true,
      });

      const productFilename = "foods.csv";
      const productHeader = [
        { id: "psprduid", title: "Product_ID" },
        { id: "psprdnme", title: "Name" },
        { id: "psprdimg", title: "Image" },
        { id: "psmrcuid", title: "Merchant_ID" },
        { id: "psprdrtg", title: "Rating" },
        { id: "psprdpri", title: "Price" },
      ];
      const thePath = "./Recommendation/";
      const path = thePath + productFilename;
      if (!fs.existsSync(thePath)) {
        fs.mkdirSync(thePath, { recursive: true });
      }
      const csvWriter = createCsvWriter({
        path: path,
        header: productHeader,
        alwaysQuote: true,
      });

      try {
        await csvWriter.writeRecords(product);
        // appendStart(req, productFilename);
      } catch (err) {
        console.error("recommendation CSV error:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      }
      // Find the rating (user id, product id, rating)
      psordrvw.belongsTo(psordpar, {
        foreignKey: "psorduid",
        targetKey: "psorduid",
      });
      psordpar.hasMany(psorditm, {
        foreignKey: "psorduid",
        sourceKey: "psorduid",
      });

      const ratingData = await psordrvw.findAll({
        raw: true,
        attributes: ["psrvwrtg"],
        include: [
          {
            model: psordpar,
            attributes: ["psmbruid"],
            required: true,
            include: [
              {
                model: psorditm,
                attributes: ["psprduid"],
                required: true,
              },
            ],
          },
        ],
      });
      

      const ratingFilename = "ratings.csv";
      const ratingHeader = [
        { id: "psordpar.psmbruid", title: "User_ID" },
        { id: "psordpar.psorditms.psprduid", title: "Product_ID" },
        { id: "psrvwrtg", title: "Rating" },
      ];
      const ratingPath = thePath + ratingFilename;
      if (!fs.existsSync(thePath)) {
        fs.mkdirSync(thePath, { recursive: true });
      }
      const csvWriterRating = createCsvWriter({
        path: ratingPath,
        header: ratingHeader,
        alwaysQuote: true,
      });

      try {
        await csvWriterRating.writeRecords(ratingData);
        // appendStart(req, ratingFilename);
      } catch (err) {
        console.error("rating CSV error:", err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
      }
      console.log("Voucher Expiry -- End");

      pssysjob.create({
        psjobcde: "RMD",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Voucher Expiry Error ", err);
      pssysjob.create({
        psjobcde: "RMD",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}

// async function send_notifications() {
//     cron.schedule('0 12 * * *', async function () {
//         try {
//             console.log("Send Bulk Push Notification -- Start");
//             let start = new Date();

//             let notifications = await prnotsch.findAll({
//                 raw: true
//             });

//             for (var i = 0; i < notifications.length; i++) {
//                 let obj = notifications[i];
//                 // Find Member
//                 let member = await psmbrprf.findOne({
//                     where: {
//                         psmbrphn: obj.psnotrcv
//                     }, raw: true
//                 });

//                 if (member)
//                     await general.appPush(obj.prnotttl, obj.prnotmsg, member.psmbrphn, "SYS", member.psmbruid);

//                 await prnotsch.destroy({
//                     where: {
//                         id: obj.id
//                     }
//                 });
//             }

//             console.log("Send Bulk Push Notification -- End");

//             pssysjob.create({
//                 psjobcde: "BULKPUSH",
//                 psjobsts: "CMP",
//                 psjobmsg: "",
//                 psjobstd: start,
//                 psjobend: new Date()
//             });
//         } catch (err) {
//             console.log("Send Bulk Push Notification Error ", err);
//             pssysjob.create({
//                 psjobcde: "BULKPUSH",
//                 psjobsts: "ERR",
//                 psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
//                 psjobstd: start,
//                 psjobend: new Date()
//             });
//         }
//     });
// }

async function transaction_expiry() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Transaction Expiry -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      // Find All Voucher (Member)
      let transaction = await pstrxpar.findAll({
        where: {
          pstrxsts: "N",
        },
        raw: true,
      });

      for (var i = 0; i < transaction.length; i++) {
        let trx = transaction[i];

        // Set Voucher to Expired
        await pstrxpar.update(
          {
            pstrxsts: "CA",
          },
          {
            where: {
              pstrxuid: trx.pstrxuid,
            },
          }
        );
      }

      console.log("Transaction Expiry -- End");

      pssysjob.create({
        psjobcde: "TRXEXPIRY",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Transaction Expiry Error ", err);
      pssysjob.create({
        psjobcde: "TRXEXPIRY",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}



async function order_expiry() {
  cron.schedule("0 0 * * *", async function () {
    try {
      console.log("Order Expiry -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      // Find All Voucher (Member)
      let order = await psordpar.findAll({
        where: {

          psordsts: { [Op.or]: ["N", "G"] }, // N = New, G = Pending

        },
        raw: true,
      });

      for (var i = 0; i < order.length; i++) {
        let ord = order[i];

        // Set Voucher to Expired
        await psordpar.update(
          {
            psordsts: "C",
          },
          {
            where: {
              psorduid: ord.psorduid,
            },
          }
        );
      }

      console.log("Order Expiry -- End");

      pssysjob.create({
        psjobcde: "OEXPIRY",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Order Expiry Error ", err);
      pssysjob.create({
        psjobcde: "OEXPIRY",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }
  });
}

async function pretrain_recommendation() {
  cron.schedule("0 30 * * *", async function () {
    try {
      console.log("pretrain_recommendation -- Start");
      let start = new Date();
      let today = new Date(start);

      today.setHours(0, 0, 0, 0);
      const userRows = await psmbrprf.findAll({
        raw: true,
        attributes: ['psmbruid']
      });

      const userIds = userRows.map(u => u.psmbruid);
      userIds.push("admin"); // Add cold start user

      for (const userId of userIds) {
        const python = spawn("python", ["app.py", userId], {
          cwd: path2.resolve(__dirname, "../Recommendation"),
        });

        let data = "";
        let error = "";

        python.stdout.on("data", (chunk) => {
          const output = chunk.toString();
          console.log(`[PYTHON stdout][${userId}]`, output);
          data += output;
        });

        python.stderr.on("data", (chunk) => {
          const err = chunk.toString();
          console.error(`[PYTHON stderr][${userId}]`, err);
          error += err;
        });

        python.on("close", (code) => {
          if (code !== 0 || error) {
            console.error(`[Python Error][${userId}] Exit code ${code}`, error);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const outputDir = path2.resolve(__dirname, "../Recommendation/outputs");
            const filePath = path2.join(outputDir, `${userId}.json`);

            // Ensure output directory exists
            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), "utf-8");
            console.log(`END -- Recommendations for ${userId} to ${filePath}`);

          } catch (e) {
            console.error(`[JSON Parse Error][${userId}]`, e.message);
            pssysjob.create({
              psjobcde: "PREXPIRY",
              psjobsts: "ERR",
              psjobmsg:
                err && err.message
                  ? JSON.stringify(err.message)
                  : JSON.stringify(err),
              psjobstd: start,
              psjobend: new Date(),
            });
          }
        });
      }
      pssysjob.create({
        psjobcde: "PREXPIRY",
        psjobsts: "CMP",
        psjobmsg: "",
        psjobstd: start,
        psjobend: new Date(),
      });
    } catch (err) {
      console.log("Pretrain recommendation Error ", err);
      pssysjob.create({
        psjobcde: "PREXPIRY",
        psjobsts: "ERR",
        psjobmsg:
          err && err.message
            ? JSON.stringify(err.message)
            : JSON.stringify(err),
        psjobstd: start,
        psjobend: new Date(),
      });
    }



  });
}


module.exports = {
  voucher_expiry: voucher_expiry,
  // send_notifications: send_notifications,
  voucher_activate: voucher_activate,
  recommendationGet: recommendationGet,
  member_expiry: member_expiry,
  transaction_expiry: transaction_expiry,
  order_expiry: order_expiry,
  pretrain_recommendation: pretrain_recommendation
};
