const cron = require("node-cron");
const exec = require('child_process').exec;
const _ = require("lodash");
const moment = require("moment");
const { v4: uuidv4 } = require('uuid');

const db = require("../models");
const Op = db.Sequelize.Op;
const psmbrprf = db.psmbrprf;
const pssysjob = db.pssysjob;


const psrwdpar = db.psrwdpar;

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
                },
            });


            for (var i = 0; i < vouchers.length; i++) {
                let vch = vouchers[i];

                // Set Voucher to Expired
                await psrwdpar.update({
                    psvchsts: "P"
                }, {
                    where: {
                        id: vch.id
                    }
                });


            }

            console.log("Voucher Expiry -- End");

            pssysjob.create({
                psjobcde: "MVEXPIRY",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "MVEXPIRY",
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


            });


            for (var i = 0; i < vouchers.length; i++) {
                let vch = vouchers[i];

                // Set Voucher to Expired
                await psrwdpar.update({
                    psvchsts: "A"
                }, {
                    where: {
                        id: vch.id
                    }
                });


            }

            console.log("Voucher Expiry -- End");

            pssysjob.create({
                psjobcde: "MVEXPIRY",
                psjobsts: "CMP",
                psjobmsg: "",
                psjobstd: start,
                psjobend: new Date()
            });
        } catch (err) {
            console.log("Voucher Expiry Error ", err);
            pssysjob.create({
                psjobcde: "MVEXPIRY",
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
    voucher_activate: voucher_activate
}