// System Job Table

module.exports = (sequelize, Sequelize) => {
    const pssysjob = sequelize.define("pssysjob", {
        psjobcde: {
            type: Sequelize.STRING(10),
            allowNull: false
            // Job Code - General Code (JOBCDE: BACK - Backup Database, SCHN - Scheduled Notification, SCHA - Scheduled Announcement, KPKTEXP - KPKT Expiry Notification, MBREXP - Membership Expiry Notification)
        },
        psjobsts: {
            type: Sequelize.STRING(5),
            allowNull: false
            // Job Status - General Code (JOBSTS: ERR - Error, CMP - Completed)
        },
        psjobmsg: {
            type: Sequelize.TEXT,
            defaultvalue: ""
            // Job Error Message
        },
        psjobstd: {
            type: Sequelize.DATE,
            allowNull: false
            // Job Start Date
        },
        psjobend: {
            type: Sequelize.DATE,
            allowNull: false
            // Job End Date
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psjobcde']
                }
            ]
        });

    return pssysjob;
};