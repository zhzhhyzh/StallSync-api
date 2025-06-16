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
    psanndtl
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
            getTopMerchants(req, "monthToDate")
        ]);

        let limit = parseInt(req.query.limit || 10);
        let page = parseInt(req.query.page || 0);
        let offset = page * limit;

        let option = buildOption(req);

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
    let option = {};

    // 1. Find user-specific announcements
    const userAnnouncements = await psanndtl.findAll({
        where: { psusrnme: req.user.psusrnme },
        attributes: ['psannuid'],
        raw: true
    });

    const userAnnIds = userAnnouncements.map(a => a.psannuid);

    // 2. Find system-wide announcements (psannast = 'Y')
    const systemAnnouncements = await pssysann.findAll({
        where: { psannast: 'Y' },
        attributes: ['psannuid'],
        raw: true
    });

    const systemAnnIds = systemAnnouncements.map(a => a.psannuid);

    // 3. Combine and deduplicate announcement IDs
    const allAnnIds = Array.from(new Set([...userAnnIds, ...systemAnnIds]));

    // 4. Return filter option
    option.where = {
        psannuid: {
            [Op.in]: allAnnIds
        }
    };

    return option;
};

// Get Number Board
const getNumberBoard = async (req) => {
    // Count all merchants
    const { count: countMch } = await psmrcpar.findAndCountAll({
        raw: true,
        attributes: ["psmrcuid"]
    });

    // Count active members
    const { count: countMbr } = await psusrprf.findAndCountAll({
        where: { psusrsts: "A", psusrtyp: "MBR" },
        raw: true,
        attributes: ["psusrunm"]
    });

    // Initialize counters
    let countOrd = 0;
    let countPrd = 0;

    if (req.user.psusrtyp === "ADM") {
        // Admin sees all
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
    }

    if (req.user.psusrtyp === "MCH") {
        // Merchant sees own
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

    return {
        countMch,
        countMbr,
        countOrd,
        countPrd
    };
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


//Get Top 10 Merchants
async function getTopMerchants(req, rankType) {
    let answr = [];

    try {
        if (rankType === "A") {
            // Rank by rating
            answr = await psmrcpar.findAll({
                attributes: ['psmrcuid', 'psmrcnme', [col('psmrcrtg'), 'rating']],
                order: [[col('psmrcrtg'), 'DESC']],
                limit: 10,
                raw: true
            });
        }

        if (rankType === "B") {
            // Rank by total sales
            answr = await psordpar.findAll({
                attributes: [
                    'psmrcuid',
                    [fn('SUM', col('psordgra')), 'totalsales']
                ],
                include: [
                    {
                        model: psmrcpar,
                        attributes: ['psmrcnme'],
                        required: true
                    }
                ],
                group: ['psordpar.psmrcuid', 'psmrcpar.psmrcnme'],
                order: [[literal('totalsales'), 'DESC']],
                limit: 10,
                raw: true
            });
        }

        if (rankType === "C") {
            // Rank by order count
            answr = await psordpar.findAll({
                attributes: [
                    'psmrcuid',
                    [fn('COUNT', col('psorduid')), 'orderscount']
                ],
                include: [
                    {
                        model: psmrcpar,
                        attributes: ['psmrcnme'],
                        required: true
                    }
                ],
                group: ['psordpar.psmrcuid', 'psmrcpar.psmrcnme'],
                order: [[literal('orderscount'), 'DESC']],
                limit: 10,
                raw: true
            });
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