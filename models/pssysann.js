// Announcement Model Table

module.exports = (sequelize, Sequelize) => {
    const pssysann = sequelize.define("pssysann", {
        psannuid: {
            type: Sequelize.STRING(10),
            unique: true,
            allowNull: false
            // Announcement Code
        },
        psannttl: {
            type: Sequelize.STRING(50),
            allowNull: false
            // Announcement Title
        },
        psannmsg: {
            type: Sequelize.TEXT,
            defaultvalue: ""
            // Announcement Message
        },
        psanntyp: {
            type: Sequelize.STRING(10),
            allowNull: false
            // Announcement Type 
            //General Type(ANNTYP) - SYS, EVT, INF
        },
        psannsts: {
            type: Sequelize.STRING(10),
            allowNull: false
            //Announcement Status
            //General Type(YESORNO)
        },
       
        psanndat: {
            type: Sequelize.DATE,
            defaultValue: new Date()
            //Announcement Notified Date Time
        },
        psannimg: {
            type: Sequelize.STRING(255),
            allowNull: false
            //Image
        },
        crtuser: {
            type: Sequelize.STRING(10)
            // Creation User
        },
        mntuser: {
            type: Sequelize.STRING(10)
            // Maintenance User
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psannuid']
                }
            ]
        });

    return pssysann;
};