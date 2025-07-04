const cron = require("node-cron");
const exec = require('child_process').exec;
const _ = require("lodash");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const db = require("../models");
const Op = db.Sequelize.Op;
const psmbrprf = db.psmbrprf;
const pssysjob = db.pssysjob;


const psrwdpar = db.psrwdpar;
const psprdpar = db.psprdpar;
const psordrvw = db.psordrvw;
const psordpar = db.psordpar;
const psorditm = db.psorditm;

// Common
const common = require("../common/common");
const general = require("../common/general");



async function voucher_expiry() {
    cron.schedule('0 0 * * *', async function () {
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
                }, raw: true
            });


            for (var i = 0; i < vouchers.length; i++) {
                let vch = vouchers[i];

                // Set Voucher to Expired
                await psrwdpar.update({
                    psrwdsts: "P"
                }, {
                    where: {
                        psrwduid: vch.psrwduid
                    }
                });


            }

            console.log("Voucher Expiry -- End");

            pssysjob.create({
                psjobcde: "VEXPIRY",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "VEXPIRY",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}

async function member_expiry() {
    cron.schedule('0 0 * * *', async function () {
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
                }, raw: true
            });

            for (var i = 0; i < members.length; i++) {
                let mbr = members[i];
                let status = mbr.psmbrtyp == 'G' ? 'S' : 'B';
                // Set Voucher to Expired
                await psmbrprf.update({
                    psmbrtyp: status,
                    psmbrexp: oneYearFromNow
                }, {
                    where: {
                        id: mbr.id
                    }
                });


            }

            console.log("Member Expiry -- End");

            pssysjob.create({
                psjobcde: "MEXPIRY",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "MEXPIRY",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}

async function voucher_activate() {
    cron.schedule('0 0 * * *', async function () {
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
                        [Op.lte]: today
                    },
                    psrwdtdt: {
                        [Op.gte]: today
                    }
                },
                raw: true

            });
            console.log("WATCH me: ", vouchers)

            for (var i = 0; i < vouchers.length; i++) {
                let vch = vouchers[i];
                console.log("foor loop: ", vch)
                // Set Voucher to Expired
                await psrwdpar.update({
                    psrwdsts: "A"
                }, {
                    where: {
                        psrwduid: vch.psrwduid
                    }
                });


            }

            console.log("Voucher Expiry -- End");

            pssysjob.create({
                psjobcde: "VACTIVE",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "VACTIVE",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
            });
        }
    });
}


async function recommendationGet() {
    cron.schedule('0 0 * * *', async function () {
        try {
            console.log("Voucher Expiry -- Start");
            let start = new Date();
            let today = new Date(start);

            today.setHours(0, 0, 0, 0);
            // Generate food csv (name, food_id,price, merchant, image, rating)
            let product = await psprdpar.findAll({
                raw: true
            });



            const productFilename = "foods.csv";
            const productHeader = [
                { id: 'psprduid', title: 'Food_ID' },
                { id: 'psprdnme', title: 'Name' },
                { id: 'psprdimg', title: 'Image' },
                { id: 'psmrcuid', title: 'Merchant_ID' },
                { id: 'psprdrtg', title: 'Rating' },
                { id: 'psprdpri', title: 'Price' }
            ]
            const thePath = './Recommendation/';
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
                return returnError(req, 500, "UNEXPECTEDERROR", res)
            }
            // Find the rating (user id, product id, rating)
            psordrvw.belongsTo(psordpar, { foreignKey: 'psorduid', targetKey: 'psorduid' });
            psordpar.hasMany(psorditm, { foreignKey: 'psorduid', sourceKey: 'psorduid' });

            const ratingData = await psordrvw.findAll({
                raw: true,
                attributes: ['psrvwrtg'],
                include: [
                    {
                        model: psordpar,
                        attributes: ['psmbruid'],
                        required: true,
                        include: [
                            {
                                model: psorditm,
                                attributes: ['psprduid'],
                                required: true
                            }
                        ]
                    }
                ]
            });

            const ratingFilename = "ratings.csv";
            const ratingHeader = [
                { id: 'psordpar.psmbruid', title: 'User_ID' },
                { id: 'psordpar.psorditms.psprduid', title: 'Food_ID' },
                { id: 'psrvwrtg', title: 'Rating' },
            ]
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
                return returnError(req, 500, "UNEXPECTEDERROR", res)
            }
            console.log("Voucher Expiry -- End");

            pssysjob.create({
                psjobcde: "RMD",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "RMD",
                psjobsts: "ERR",
                psjobmsg: err && err.message ? JSON.stringify(err.message) : JSON.stringify(err),
                psjobstd: start,
                psjobend: new Date()
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

module.exports = {
    voucher_expiry: voucher_expiry,
    // send_notifications: send_notifications,
    voucher_activate: voucher_activate,
    recommendationGet: recommendationGet,
    member_expiry: member_expiry,
}