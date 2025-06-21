// Tramsaction Parameters Model

module.exports = (sequelize, Sequelize) => {
    const pstrxpar = sequelize.define("pstrxpar", {
        pstrcuid: {
            type: Sequelize.STRING(50),
            allowNull: false,
            // Transaction ID
        },
        psorduid: {
            type: Sequelize.STRING(25),
            allowNull: false,
            // Order ID
        },
        pstrxdat: {
            type: Sequelize.DATE,
            allowNull: false,
            // Transaction Date
        },
        pstrxamt: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            // Transaction Amount
        },
        pstrxsts: {
            type: Sequelize.STRING(10),
            allowNull: false,
            // Transaction Status

        },
        pstrxcrc: {
            type: Sequelize.STRING(10),
            allowNull: false,
            // Transaction Currency
        },
        pstrxmtd: {
            type: Sequelize.STRING(10),
            allowNull: false,
            // Transaction Method
        },
        pstrxba1: {
            type: Sequelize.STRING(255),
            allowNull: true,
            //Transaction Billing Address 1
        },
        pstrxba2: {
            type: Sequelize.STRING(255),
            allowNull: true,
            //Transaction Billing Address 2
        },
        pstrxbpo: {
            type: Sequelize.STRING(25),
            allowNull: true,
            //Transaction Billing Postcode
        },
        pstrxbci: {
            type: Sequelize.STRING(25),
            allowNull: true,
            //Transaction Billing City
        },
        pstrxbst: {
            type: Sequelize.STRING(25),
            allowNull: true,
            //Transaction Billing State
        },
        pstrxstr: {
            type: Sequelize.STRING(25),
            allowNull: true,
            //Transaction Stripe ID
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['pstrcuid']
                }
            ]
        });
    return pstrxpar;
}