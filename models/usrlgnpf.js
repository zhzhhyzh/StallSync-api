//userlogin record

module.exports = (sequelize, Sequelize) => {
    const usrlgnpf = sequelize.define("usrlgnpf", {
        psusrunm: {
            type: Sequelize.STRING(255),
            unique: true,
            allowNull: false
            // Username
        },
        pslgnsts: {
            type: Sequelize.BOOLEAN,
            defaultvalue: false
            // Login Status
        },
        pslgidat: {
            type: Sequelize.DATE,
            allowNull: false
            // Login Time
        },
        pslgodat: {
            type: Sequelize.DATE
            // Logout Time
        },
        pslgntkn: {
            type: Sequelize.STRING(250)
            // Login Token
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

    return usrlgnpf;
};