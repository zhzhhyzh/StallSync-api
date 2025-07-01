// Import Dependencies
const db = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const Sequelize = require("../common/db").sequelize;
const common = require('../common/common')
// Table Models
const {
    psordpar,
    psprdpar,
    psmrcpar,
    psusrprf,
    pssysann,
    psmbrprf
} = db;

// Common Functions
const returnError = require("../common/error");
const returnSuccess = require("../common/success");
const returnSuccessMessage = require("../common/successMessage");
const db_query = require("../common/db").sequelize;
exports.main = async (req, res) => {
    try {
        const [
            numberBoard,
            salesChart,
            orderChart,
            topMerchants,
        ] = await Promise.all([
            getNumberBoard(req),
            getSalesChart(req),
            getOrderChart(req, false),
            getTopMerchants(req, "A")
        ]);

        let limit = parseInt(req.query.limit || 10);
        let page = parseInt(req.query.page || 0);
        let offset = page * limit;

        let option = await buildOption(req);

        const { count, rows } = await pssysann.findAndCountAll({
            limit,
            offset,
            where: option,
            attributes: [
                ["psannuid", "id"],
                "psannttl",
                "psannmsg",
                "psanntyp",
                "psannsts",
                "psanndat",
                "psannimg",
            ],
            order: [["psannuid", "desc"]],
        });

        const newRows = await enrichAnnouncements(rows, req);

        return returnSuccess(
            200,
            {
                numberBoard,
                salesChart,
                orderChart,
                topMerchants,
                announcement: newRows,
            },
            res
        );
    } catch (err) {
        console.error(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
};

//Announcement Build
const buildOption = async (req) => {
    //   const userAnnouncements = await psanndtl.findAll({
    //     where: { psusrnme: req.user.psusrnme },
    //     attributes: ['psannuid'],
    //     raw: true
    //   });

    //   const userAnnIds = userAnnouncements.map(a => a.psannuid);

    const systemAnnouncements = await pssysann.findAll({
        // where: { psannast: 'Y' },
        attributes: ['psannuid'],
        raw: true
    });

    const systemAnnIds = systemAnnouncements.map(a => a.psannuid);

    // Merge and deduplicate
    const allAnnIds = Array.from(new Set([...systemAnnIds]));

    // Check if empty
    if (allAnnIds.length === 0) {
        return { psannuid: { [Op.eq]: null } }; // Will return no rows
    }

    return { psannuid: { [Op.in]: allAnnIds } };
};

const enrichAnnouncements = async (rows, req) => {
    return Promise.all(
        rows.map(async (obj) => {
            if (obj.psanntyp) {
                const description = await common.retrieveSpecificGenCodes(
                    req,
                    "ANNTYP",
                    obj.psanntyp
                );
                obj.psanntypdsc = description.prgedesc || "";
            }
            if (obj.psannsts) {
                const description = await common.retrieveSpecificGenCodes(
                    req,
                    "YESORNO",
                    obj.psannsts
                );
                obj.psannstsdsc = description.prgedesc || "";
            }

            obj.psanndat = await common.formatDateTime(obj.psanndat, "24");
            return obj;
        })
    );
};


// Get Number Board
const getNumberBoard = async (req) => {
    // Count all merchants
    const { count: countMch } = await psmrcpar.findAndCountAll({
        raw: true,
        attributes: ["psmrcuid"]
    });

    // Count active members
    const { count: countMbr } = await psmbrprf.findAndCountAll({

        raw: true,
        attributes: ["psmbrnam"]
    });

    // Initialize counters
    let countOrd = 0;
    let countPrd = 0;

    if (req.user.psusrtyp === "ADM") {
        const { count: ordCount } = await psordpar.findAndCountAll({
            raw: true,
            attributes: ["psorduid"]
        });
        const { count: prdCount } = await psprdpar.findAndCountAll({
            raw: true,
            attributes: ["psprduid"]
        });
        countOrd = ordCount;
        countPrd = prdCount;
    } else if (req.user.psusrtyp === "MCH") {
        const { count: ordCount } = await psordpar.findAndCountAll({
            where: { psmrcuid: req.user.psmrcuid },
            raw: true,
            attributes: ["psorduid"]
        });
        const { count: prdCount } = await psprdpar.findAndCountAll({
            where: { psmrcuid: req.user.psmrcuid },
            raw: true,
            attributes: ["psprduid"]
        });
        countOrd = ordCount;
        countPrd = prdCount;
    }

    // Return in required format
    return [
        { counts: countMbr, description: "Member" },
        { counts: countMch, description: "Merchant" },
        { counts: countOrd, description: "Order" },
        { counts: countPrd, description: "Product" }
    ];
};


// Get Sales Data
async function getSalesChart(req) {
    try {
        const today = new Date();

        // Start from 1st of the month, 11 months ago
        const pastYearStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        // End on the last day of the current month
        const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Set base filter: only completed orders within date range
        const whereClause = {
            psordocd: {
                [Op.between]: [pastYearStart, endOfThisMonth]
            }
        };

        // If merchant user, limit by merchant ID
        if (req.user.psusrtyp === "MCH") {
            whereClause.psmrcuid = req.user.psmrcuid;
        }

        // Query sales grouped by month
        const results = await psordpar.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('psordocd'), '%b'), 'month'], // e.g., 'Jan', 'Feb'
                [fn('SUM', col('psordgra')), 'totalSales']
            ],
            where: whereClause,
            group: [fn('DATE_FORMAT', col('psordocd'), '%Y-%m')], // group by year+month
            order: [literal("MIN(psordocd)")], // ensure ascending order
            raw: true
        });

        // Fill in missing months with zero
        const months = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const resultMap = {};
        results.forEach(row => resultMap[row.month] = parseFloat(row.totalSales));

        for (let i = 0; i < 12; i++) {
            const date = new Date(pastYearStart.getFullYear(), pastYearStart.getMonth() + i, 1);
            const month = monthNames[date.getMonth()];
            months.push({
                month,
                totalSales: resultMap[month] || 0
            });
        }

        return months;
    } catch (error) {
        console.error("Error in getSalesChart:", error);
        return [];
    }
}

//Get order chart
async function getOrderChart(req) {
    try {

        const today = new Date();

        // Start from 1st of the month, 11 months ago
        const pastYearStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);

        // End on the last day of the current month
        const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Build base where clause
        const whereClause = {
            psordocd: {
                [Op.between]: [pastYearStart, endOfThisMonth]
            }
        };

        // If user is merchant, filter by merchant ID
        if (req.user.psusrtyp === "MCH") {
            whereClause.psmrcuid = req.user.psmrcuid;
        }

        // Query total orders per month
        const results = await psordpar.findAll({
            attributes: [
                [fn('DATE_FORMAT', col('psordocd'), '%b'), 'month'], // e.g., 'Jul'
                [fn('COUNT', col('psorduid')), 'totalOrders']
            ],
            where: whereClause,
            group: [fn('DATE_FORMAT', col('psordocd'), '%Y-%m')],
            order: [literal('MIN(psordocd)')],
            raw: true
        });

        // Fill missing months with zero
        const resultMap = {};
        results.forEach(row => {
            resultMap[row.month] = parseInt(row.totalOrders);
        });

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const output = [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(pastYearStart.getFullYear(), pastYearStart.getMonth() + i, 1);
            const month = monthNames[date.getMonth()];
            output.push({
                month,
                totalOrders: resultMap[month] || 0
            });
        }

        return output;
    } catch (err) {
        console.error("Error in getOrderChart:", err);
        return [];
    }
}


async function getTopMerchants(req, rankType) {
    let answr = [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59); // end of month at 23:59:59

    try {
        if (rankType === "A") {
            // Rank by rating (no date filter needed)
            answr = await psmrcpar.findAll({
                attributes: ['psmrcuid', 'psmrcnme', [col('psmrcrtg'), 'value']],
                order: [[col('psmrcrtg'), 'DESC']],
                limit: 10,
                raw: true
            });
        }

        if (rankType === "B") {
            // Rank by total sales (this month)

            psordpar.belongsTo(psmrcpar, {
                foreignKey: 'psmrcuid',
                targetKey: 'psmrcuid'
            });

            answr = await psordpar.findAll({
                attributes: [
                    'psmrcuid',
                    [fn('SUM', col('psordgra')), 'value']
                ],
                include: [
                    {
                        model: psmrcpar,
                        attributes: ['psmrcnme'],
                        required: true
                    }
                ],
                where: {
                    psordodt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                },
                group: ['psordpar.psmrcuid', 'psmrcpar.psmrcnme'],
                order: [[literal('value'), 'DESC']],
                limit: 10,
                raw: true
            });
            answr = answr.map(item => ({
                psmrcuid: item.psmrcuid,
                psmrcnme: item['psmrcpar.psmrcnme'],
                value: parseFloat(item.value),
            }));

        }

        if (rankType === "C") {

            psordpar.belongsTo(psmrcpar, {
  foreignKey: 'psmrcuid',
  targetKey: 'psmrcuid'
});

            // Rank by order count (this month)
            answr = await psordpar.findAll({
                attributes: [
                    'psmrcuid',
                    [fn('COUNT', col('psorduid')), 'value']
                ],
                include: [
                    {
                        model: psmrcpar,
                        attributes: ['psmrcnme'],
                        required: true
                    }
                ],
                where: {
                    psordodt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                },
                group: ['psordpar.psmrcuid', 'psmrcpar.psmrcnme'],
                order: [[literal('value'), 'DESC']],
                limit: 10,
                raw: true
            });

              answr = answr.map(item => ({
                psmrcuid: item.psmrcuid,
                psmrcnme: item['psmrcpar.psmrcnme'],
                value: parseFloat(item.value),
            }));
        }

        return answr;
    } catch (err) {
        console.error("Error in getTopMerchants:", err);
        return [];
    }
}

exports.getTopMerchants = async (req, res) => {
    try {
        const topMerchants = await getTopMerchants(req, req.query.option);

        return returnSuccess(
            200,
            {
                topMerchants,
            },
            res
        );
    } catch (err) {
        console.error(err);
        return returnError(req, 500, "UNEXPECTEDERROR", res);
    }
};