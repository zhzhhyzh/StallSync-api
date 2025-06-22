// Reset Password

module.exports = (sequelize, Sequelize) => {
    const psrstpwd = sequelize.define("psrstpwd", {
       psrstuid: {
            type: Sequelize.STRING(50),
            allowNull: false
            // Reset UID
        },
       psrstusr: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Username
        },
       psrstgdt: {
            type: Sequelize.DATE
            // Generate Date
        },
       psrstudt: {
            type: Sequelize.DATE
            // Used Date
        },
       psrststs: {
            type: Sequelize.STRING(1)
            // Reset Passowrd Status : A - Active / E - Expired / U - Used / I - Invalid
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
                    fields: [
                        'psrstusr'
                    ]
                }
            ]
        });

    return psrstpwd;
};