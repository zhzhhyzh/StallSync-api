// User Web Push Subscription
module.exports = (sequelize, Sequelize) => {
    const backup = sequelize.define("backup", {
        filename: {
            type: Sequelize.STRING(255),
            allowNull: false
            // Generated File name
        },
        mode: {
            type: Sequelize.STRING(10),
            defaultValue: "AUTO"
            // Generated Mode - General Code (BCKMODE: AUTO - Auto, MANU - Manual)
        },
        user: {
            type: Sequelize.STRING(255),
            defaultValue: "SYSTEM"
            // Generated User
        },
        status: {
            type: Sequelize.STRING(10),
            defaultValue: "CMP"
            // Generation Status - General Code (BCKSTS: CMP - Completed, FAL - Failed, DOW - Downloaded)
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    fields: ['filename', 'mode']
                }
            ]
        });

    return backup;
};