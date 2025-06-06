// Back Office User Table

module.exports = (sequelize, Sequelize) => {
    const errlogpf = sequelize.define("errlogpf", {
        api: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        error_code: {
            type: Sequelize.STRING(5000),
            allowNull: false
        },
        error_desc: {
            type: Sequelize.STRING(5000),
            default: ''
        },
        incoming: {
            type: Sequelize.STRING(5000)
        },
        caller: {
            type: Sequelize.STRING(100),
            allowNull: false
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['api']
                }
            ]
        });

    return errlogpf;
};