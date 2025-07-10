//Order Parameter

module.exports = (sequelize, Sequelize) => {
    const psordpar = sequelize.define("psordpar", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        psorduid: {
            type: Sequelize.STRING(50),
            allowNull: false,
            primaryKey: true,
            comment: "Order ID"
        },
        psordodt: {
            type: Sequelize.DATE,
            defaultValue: new Date(),
            allowNull: false,
            comment: "Order Date"
        },
        psordamt: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            comment: "Total Amount"
        },
        psordrap: {
            type: Sequelize.STRING(10),
            allowNull: false,
            comment: "Reward Applied"
        },
        psrwduid: {
            type: Sequelize.STRING(10),
            comment: "Reward ID"
        },
        psordrdv: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: "Reward Discounted Value"
        },
        psordpap: {
            type: Sequelize.STRING(10),
            allowNull: false,
            comment: "Point Applied"
        },
        psordpdv: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            comment: "Point Discounted Value"
        },
        psordgra: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            comment: "Grand Total"
        },
        psmbruid: {
            type: Sequelize.STRING(25),
            allowNull: true,
            comment: "Member ID"
        },
        psordpre: {
            type: Sequelize.STRING(10),
            allowNull: false,
            comment: "Phone No Prefix"
        },
        psordphn: {
            type: Sequelize.STRING(25),
            allowNull: false,
            comment: "Member Phone No"
        },
        psmrcuid: {
            type: Sequelize.STRING(25),
            allowNull: false,
            comment: "Merchant ID"
        },
        psordsts: {
            type: Sequelize.STRING(10),
            allowNull: false,
            defaultValue: 'N',
            comment: "Order Status"
        },
        psordocd: {
            type: Sequelize.DATE,
            allowNull: false,
            comment: "Order Completed Date"
        },
        psordsst: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            comment: "SST Amount"
        }
    }, {
        tableName: 'psordpar',
        timestamps: true
    });

    return psordpar;
};
