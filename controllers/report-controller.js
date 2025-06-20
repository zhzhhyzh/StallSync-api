const db = require("../models");
const Op = db.Sequelize.Op;
const returnError = require('../common/error');
const returnSuccess = require('../common/success');
const returnSuccessMessage = require('../common/successMessage');
const common = require('../common/common');
const { spawn } = require("child_process");

const config = require('../constant/generalConfig');
const short = require('short-uuid');
const _ = require('lodash');
const fs = require('fs');
const db_query = require('../common/db').sequelize;
const sequelize = require("sequelize");
const connection = require("../common/db");
const fsP = require("fs").promises;
const path = require("path");
// Model
const psmbrprf = db.psmbrprf;
const prrpthis = db.prrpthis;
const psusrprf = db.psusrprf;
const psordpar = db.psordpar;
const psdocmas = db.psdocmas;
const psmrcpar = db.psmrcpar;

// Path Variable
const RPTPath = config.reportPath;

exports.generate = async (req, res) => {
    let type = req.body.type;
    let user = req.query.psmrcuid ? req.query.psmrcuid : "";

    if (_.isEmpty(type) || type == "") return returnError(req, 500, "REPORTTYPEISREQUIRED", res);

    let rows = [];
    let start_date = new Date();
    let end_date = new Date();
    end_date.setHours(23, 59, 59, 999); // end of today

    if (type === "M") {
        // One month range from today
        start_date = new Date();
        start_date.setMonth(start_date.getMonth() - 1);
        start_date.setHours(0, 0, 0, 0);

    } else if (type === "T") {
        // Three months range from today
        start_date = new Date();
        start_date.setMonth(start_date.getMonth() - 3);
        start_date.setHours(0, 0, 0, 0);

    } else if (type === "Y") {
        // One year range from today
        start_date = new Date();
        start_date.setFullYear(start_date.getFullYear() - 1);
        start_date.setHours(0, 0, 0, 0);
    }



    let option = {}
    option.psordsts = "D"
    if (user) {
        option.psmrcuid = user;
    }

    if (start_date && !_.isNaN(start_date.getTime())) {
        if (end_date && !_.isNaN(end_date.getTime())) {
            option.createdAt = {
                [Op.and]: [
                    { [Op.gte]: start_date },
                    { [Op.lte]: end_date }
                ]
            }
        } else {
            option.createdAt = { [Op.gte]: start_date }
        }
    } else {
        if (end_date && !_.isNaN(end_date.getTime())) {
            option.createdAt = {
                [Op.lte]: end_date
            }
        } else {
            let today = new Date();
            today.setHours(23, 59, 59, 999);
            option.createdAt = {
                [Op.lte]: today
            }
        }
    }

    rows = await psordpar.findAll({
        where: option, raw: true, order: [['createdAt', 'asc']], attributes: ["psorduid", "psordgra", "psmbruid", "psmrcuid", "psordsts", "psordocd"]
    });


    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];

        let result = await psmbrprf.findOne({ where: { psmbruid: obj.psmbruid }, raw: true, attributes: ["psmbrnam"] })
        obj.psmbrnam = result.psmbrnam || "";

        let merchant = await psmrcpar.findOne({ where: { psmrcuid: obj.psmrcuid }, raw: true, attributes: ["psmrcnme"] })
        obj.psmrcnme = merchant.psmrcnme || "";

        // Get Order Status
        let status = await common.retrieveSpecificGenCodes(null, "ODRSTS", obj.psodrsts);
        if (status && !_.isEmpty(status.prgedesc)) obj.psodrstsdsc = status.prgedesc;

        obj.psordocd = await common.formatDateTime(obj.psordocd, "12");
        obj.psordgra = await common.format_number(obj.psordgra);

        newRows.push(obj);
    }

    // Write to Excel
    let header = [
    ];

    header = [
        { id: 'psorduid', title: 'Order_ID' },
        { id: 'psmbrnam', title: 'Member_Name' },
        { id: 'psordocd', title: 'Transaction_Date' },
        { id: 'psordgra', title: 'Transaction_Amount' },
        { id: 'psmrcnme', title: 'Merchant_Name' },
        { id: 'psordsts', title: 'Order_Status' },


    ]



    // let report_type = await common.retrieveSpecificGenCodes(null, 'RPTTYPE', rpt_type);
    let report_type = "OrderAndSalesReport";
    if (!start_date || _.isNaN(start_date.getTime())) start_date = new Date();
    if (!end_date || _.isNaN(end_date.getTime())) end_date = new Date();



    let dd_start = start_date.getDate();
    let mm_start = start_date.getMonth() + 1;
    let yy_start = start_date.getFullYear().toString().substring(2); // last 2 digits
    let dd_end = end_date.getDate();
    let mm_end = end_date.getMonth() + 1;
    let yy_end = end_date.getFullYear().toString().substring(2);

    let filename = "";

    if (type === "M") {
        filename = `${report_type}-${yy_start}${_.padStart(mm_start, 2, '0')}${_.padStart(dd_start, 2, '0')}-${yy_end}${_.padStart(mm_end, 2, '0')}${_.padStart(dd_end, 2, '0')}`;
    } else if (type === "T") {
        filename = `${report_type}-${yy_start}${_.padStart(mm_start, 2, '0')}${_.padStart(dd_start, 2, '0')}-${yy_end}${_.padStart(mm_end, 2, '0')}${_.padStart(dd_end, 2, '0')}`;
    } else if (type === "Y") {
        filename = `${report_type}-${yy_start}${_.padStart(mm_start, 2, '0')}${_.padStart(dd_start, 2, '0')}-${yy_end}${_.padStart(mm_end, 2, '0')}${_.padStart(dd_end, 2, '0')}`;
    } else {
        filename = `${report_type}`;
    }

    let running_number = 1;
    let dup_check = await prrpthis.findOne({
        where: {
            prrptnme: filename + "-" + running_number + ".csv"
        }, raw: true
    });
    while (dup_check) {
        running_number++;
        dup_check = await prrpthis.findOne({
            where: {
                prrptnme: filename + "-" + running_number + ".csv"
            }, raw: true
        });
    }
    filename = filename + "-" + running_number + ".csv";

    let rpthis = '';
    // // Write to Report Table
    await prrpthis.create({
        prrptnme: filename,
        prrptgdt: new Date(),
        prrptsts: 'P',
        prrptusr: req.user.psusrunm,
        prrptmch: user
    }).then(data => {
        rpthis = data.get({ plain: true });
    });

    let date = "";
    const formattedStart = `${_.padStart(dd_start, 2, '0')}/${_.padStart(mm_start, 2, '0')}/${start_date.getFullYear()}`;
    const formattedEnd = `${_.padStart(dd_end, 2, '0')}/${_.padStart(mm_end, 2, '0')}/${end_date.getFullYear()}`;

    if (type === "M" || type === "T" || type === "Y") {
        date = `${formattedStart} - ${formattedEnd}`;
    }

    await common.writeReport(req, header, newRows, rpthis, filename, type, date).catch(err => {
        console.log(err);
    });


    return returnSuccessMessage(req, 200, "REQUESTSUBMITTED", res);
    // } return returnSuccessMessage(req, 200, "REQUESTSUBMITTED", res);
}

exports.list = async (req, res) => {
    let merchantid = req.user.psusrtyp == "MCH" ? req.query.psmrcuid : "";

    let limit = 10;
    if (req.query.limit) limit = req.query.limit;

    let from = 0;
    if (!req.query.page) from = 0;
    else from = parseInt(req.query.page) * parseInt(limit);

    let option = {};
    if (req.query.prrpttyp && !_.isEmpty(req.query.prrpttyp)) option.prrpttyp = req.query.prrpttyp;
    if (merchantid && !_.isEmpty(req.query.prrpttyp)) {
        option.prrptmrc = merchantid

    }
    const { count, rows } = await prrpthis.findAndCountAll({
        limit: parseInt(limit),
        offset: from,
        where: option,
        raw: true,
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'prcrtusr', 'prmntusr']
        }, order: [['createdAt', 'desc']]
    });

    let newRows = [];
    for (var i = 0; i < rows.length; i++) {
        let obj = rows[i];
        obj.prrpttypdsc = obj.prrpttyp;

        if (!_.isEmpty(obj.prrptsts)) {
            let rptsts = await common.retrieveSpecificGenCodes(req, 'RPTSTS', obj.prrptsts);
            obj.prrptstsdsc = rptsts && rptsts.prgedesc ? rptsts.prgedesc : '';
        }

        if (!_.isEmpty(obj.prrptusr)) {
            let rptusr = await psusrprf.findOne({
                where: {
                    psusrunm: obj.prrptusr
                }, raw: true
            });
            if (rptusr) obj.prrptusrdsc = rptusr.psusrnam;
            else obj.prrptusrdsc = obj.prrptusr;
        }

        if (!_.isEmpty(obj.prrptusr)) {
            let rptusr = await psmrcpar.findOne({
                where: {
                    psmrcuid: obj.prrptmch
                }, raw: true
            });
            if (rptusr) obj.prrptmchdsc = rptusr.psmrcnme;
            else obj.prrptmchdsc = obj.prrptmch;
        }

        obj.prrptgdt = await common.convertDate(obj.prrptgdt);
        let newDate = new Date();
        newDate = await common.convertDate(newDate, 'yyyy-MM-dd');
        let fileName = obj.prrpttyp + '-' + newDate + '.csv';
        obj.prrptnme2 = fileName;
        newRows.push(obj);
    }

    if (count > 0) return returnSuccess(200, { total: count, data: newRows }, res);
    else return returnSuccess(200, { total: 0, data: [] }, res);
}

exports.download = async (req, res) => {
    let filename = req.query.filename ? req.query.filename : '';
    if (!filename || filename == '') return returnError(req, 500, "RECORDIDISREQUIRED", res);

    prrpthis.findOne({
        where: {
            prrptnme: filename
        }, raw: true
    }).then(async rpt => {
        if (rpt) {
            let path = '';
            path = RPTPath;
            let report_type = "OrderAndSalesReport";
            let newDate = new Date();
            newDate = await common.convertDate(newDate, 'yyyy-MM-dd');
            let file = `${path}${filename}`;
            let fileName = report_type && !_.isEmpty(report_type.prgedesc) ? report_type.prgedesc + '-' + newDate + '.csv' : rpt.prrpttyp + '-' + newDate + '.csv';
            res.setHeader('Content-type', 'text/csv');
            res.download(file, fileName);
        } else return returnError(req, 500, "NORECORDFOUND", res);
    }).catch(err => {
        console.log(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    });


}

exports.forecast = async (req, res) => {
    const forecast_type = req.body.forecast_type ? req.body.forecast_type : "";
    const id = req.body.prrptnme ? req.body.prrptnme : "";
    if (id == "") return returnError(req, 500, { id: "RECORDIDISREQUIRED" }, res);
    if (forecast_type == "") return returnError(req, 500, { forecast_type: "RECORDIDISREQUIRED" }, res);
    try {

        const pythonProcess = spawn("python", ["./ML/app.py"]);

        pythonProcess.stdin.write(JSON.stringify({
            forecast_type: forecast_type,
            prrptnme: id
        }));
        pythonProcess.stdin.end();

        let responseData = "";

        pythonProcess.stdout.on("data", (chunk) => {
            console.log("Raw Python Response:", chunk.toString());
            responseData += chunk.toString();
        });


        pythonProcess.stderr.on("data", (data) => {
            console.error("Python Error:", data.toString());
        });



        pythonProcess.on("close", async (code) => {
            if (code !== 0) {
                console.error(`[PYTHON ERROR] Exit code: ${code}`);
                console.error(`[PYTHON STDERR]`, errorData);
                return returnError(req, 500, "Forecast Failed, Unexpected Error", res);
            }

            if (!responseData.trim()) {
                console.error("No response received from Python script.");
                return returnError(req, 500, "Empty Returning from Forecasting", res);
            }
            try {
                const jsonResponse = JSON.parse(responseData.trim());
                const t = await connection.sequelize.transaction();

                // Update forecast status in DB
                await prrpthis.update(
                    forecast_type === "S"
                        ? { prrptfcs: "Y" }
                        : { prrptfco: "Y" },
                    {
                        where: { prrptnme: id },
                    }, { transaction: t }
                );
                let ext = ".png"
                await psdocmas.create({ psdocfnm: jsonResponse.filename, psdoconm: jsonResponse.filename, psdocudt: new Date(), psdocext: ext.toString().toLowerCase() })
                // Save forecast image
                await common.writeImage(
                    config.documentTempPath,
                    config.forecastImagePath,
                    jsonResponse.filename,
                    req.user.psusrunm,
                    7
                ).catch(async (err) => {
                    await t.rollback();
                    console.log("ERR Write Img: ", err);
                    return returnError(req, 500, "Image Write Failed", res);
                });

                await t.commit();
                if (!res.headersSent) return returnSuccessMessage(req, 200, "Request Processed", res);



            } catch (error) {
                console.error("JSON Parsing Error:", error);
                await t.rollback();
                console.error("Raw Response:", responseData);
                return returnError(req, 500, "INVALIDJSONRESPONSE", res);
            }
        });

    } catch (error) {
        console.error("Error in processing:", error);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
}

exports.findForecast = async (req, res) => {
    const { prrptnme, prrptfcs, prrptfco } = req.query;
    if (!prrptnme || !prrptfco || !prrptfcs) {
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }

    console.log("HJHJHHH")

    prrpthis.findOne({
        where: {
            prrptnme: prrptnme
        }, raw: true, attributes: ['prrptnme']
    }).then(async (data) => {
        if (!data) return returnError(req, 500, "UNEXPECTEDERROR", res);
        let order = {}, sales = {};

        const basename = path.basename(prrptnme, path.extname(prrptnme));

        if (prrptfco == "Y") {

            // 2. Set image filename
            order.ordFcImg = `order-${basename}.png`;

            // 3. Read and parse forecast CSV
            const filePath = `./documents/forecast_file/forecastOrder-${basename}.csv`;
            try {
                const fileContent = await fsP.readFile(filePath, "utf8");
                const rows = fileContent.split("\n").slice(1);
                order.ordFcValue = rows.filter(row => row.trim()).map(row => {
                    const [rawDate, rawValue] = row.split(",");
                    const dateObj = new Date(rawDate);
                    const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
                    return { date: formattedDate, value: parseFloat(rawValue).toFixed(2) };
                });
            } catch (err) {
                console.error("Failed to read Order forecast:", err.message);
                order.ordFcValue = [];
            }
        }

        if (prrptfcs == "Y") {
            // 2. Set image filename
            sales.slsFcImg = `sales-${basename}.png`;

            // 3. Read and parse forecast CSV
            const filePath = `./documents/forecast_file/forecastSales-${basename}.csv`;
            try {
                const fileContent = await fsP.readFile(filePath, "utf8");
                const rows = fileContent.split("\n").slice(1);
                sales.slsFcValue = rows.filter(row => row.trim()).map(row => {
                    const [rawDate, rawValue] = row.split(",");
                    const dateObj = new Date(rawDate);
                    const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${dateObj.getFullYear()}`;
                    return { date: formattedDate, value: parseFloat(rawValue).toFixed(2) };
                });
            } catch (err) {
                console.error("Failed to read Sales forecast:", err.message);
                sales.slsFcValue = [];
            }
        }
        return returnSuccess(
            200,
            {
                order,
                sales
            },
            res
        );

    })
}

async function formatMonth(month, type) {
    return new Promise((resolve, reject) => {
        let month_string = "";
        switch (month) {
            case 0:
                if (type == "F")
                    month_string = "January";
                else
                    month_string = "Jan";
                break;
            case 1:
                if (type == "F")
                    month_string = "February";
                else
                    month_string = "Feb";
                break;
            case 2:
                if (type == "F")
                    month_string = "March";
                else
                    month_string = "Mar";
                break;
            case 3:
                if (type == "F")
                    month_string = "April";
                else
                    month_string = "Apr";
                break;
            case 4:
                month_string = "May";
                break;
            case 5:
                if (type == "F") month_string = "June";
                else
                    month_string = "Jun";
                break;
            case 6:
                if (type == "F") month_string = "July";
                else
                    month_string = "Jul";
                break;
            case 7:
                if (type == "F") month_string = "August";
                else
                    month_string = "Aug";
                break;
            case 8:
                if (type == "F") month_string = "September";
                else
                    month_string = "Sep";
                break;
            case 9:
                if (type == "F") month_string = "October";
                else
                    month_string = "Oct";
                break;
            case 10:
                if (type == "F") month_string = "November";
                else
                    month_string = "Nov"
                break;
            case 11:
                if (type == "F") month_string = "December";
                else
                    month_string = "Dec"
                break;
            default:
                month_string = "";
                break;
        }
        return resolve(month_string);
    })
}
