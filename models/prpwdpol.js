// Back Office Department Table

module.exports = (sequelize, Sequelize) => {
    const prpwdpol = sequelize.define("prpwdpol", {
        prpwdatm: {
            type: Sequelize.INTEGER,
            allowNull: false
            // Failed Attempts to Lock Account
        },
        pratmmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Failed Attempts Error Message
        },
        prpwdlen: {
            type: Sequelize.INTEGER,
            allowNull: false
            // Password Length
        },
        prlenmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Length Error Message
        },
        prpwdfrq: {
            type: Sequelize.INTEGER,
            allowNull: false
            // Password Change Frequency
        },
        prfrqmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Change Password Frequency Error Message
        },
        prpwdupc: {
            type: Sequelize.BOOLEAN,
            allowNull: false
            // Password Require Upper Case Letter?
        },
        prupcmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Require Uppercase Letter Error Message
        },
        prpwdlwc: {
            type: Sequelize.BOOLEAN,
            allowNull: false
            // Password Require Lowercase Letter?
        },
        prlwcmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Require Lowercase Letter Message
        },
        prpwdspc: {
            type: Sequelize.BOOLEAN,
            allowNull: false
            // Password Require Special Character?
        },
        prspcmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Require Special Character Message
        },
        prspcchr: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Allowed Special Characters
        },
        prscrmsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Allowed Special Character Message
        },
        prpwdnum: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
            // Password Require Numeric Character
        },
        prnummsg: {
            type: Sequelize.STRING(50),
            defaultValue: ''
            // Password Require Numeric Character Message
        },
        prcrtusr: {
            type: Sequelize.STRING(255)
            // Creation User
        },
        prmntusr: {
            type: Sequelize.STRING(255)
            // Maintenance User
        }
    }, { freezeTableName: true },
        {
            indexes: [
            ]
        });

    return prpwdpol;
};