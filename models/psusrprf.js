// Back Office User Table

module.exports = (sequelize, Sequelize) => {
    const psusrprf = sequelize.define("psusrprf", {
        psusrunm: {
            type: Sequelize.STRING(255),
            unique: true,
            allowNull: false
            // Username
        },
        psusrnam: {
            type: Sequelize.STRING(50),
            allowNull: false
            // Name
        },
        psusreml: {
            type: Sequelize.STRING(100)
            // Email Address
        },
        psusrpwd: {
            type: Sequelize.STRING(250),
            allowNull: false
            // Password
        },
        psusrsts: {
            type: Sequelize.STRING(1),
            defaultvalue: true
            // Account Status - General Code (USRSTS, A - Active, L - Locked , C - Closed, E-Expired)
        },
        psusrtyp: {
            type: Sequelize.STRING(10),
            allowNull: false
            // User Type - General Code (USRTYP, ADM - Admin, MBR - Member, MCH - Merchant)
        },
        psusrphn: {
            type: Sequelize.STRING(20)
            // HP Number
        },
        psstsdt8: {
            type: Sequelize.DATE
            // Status Change Date
        },
        pspwdatm: {
            type: Sequelize.INTEGER,
            defaultValue: 0
            // Password Attempts
        },
        pschgpwd: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
            // Change Password Flag
        },
        
        psfstlgn: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
            // First Login Flag
        },
   
        psusrrol: {
            type: Sequelize.STRING(3),
            defaultValue: "MBR"
            //User Role - General Code(USRROLE)
            //ADM - Admin, BO - Back Office, MBR - Member
        },
        
        psmsgurd: {
            type: Sequelize.STRING(1),
            defaultValue: "N"
            // Unread Messages
        },
        crtuser: {
            type: Sequelize.STRING(255)
            // Creation User
        },
        mntuser: {
            type: Sequelize.STRING(255)
            // Maintenance User
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psusrunm']
                }
            ]
        });

    return psusrprf;
};