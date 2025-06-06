// Back Office User Table

module.exports = (sequelize, Sequelize) => {
    const mntlogpf = sequelize.define("mntlogpf", {
        prmntfile: {
            type: Sequelize.STRING(25),
            allowNull: false
        },
        prmntkey: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        prfieldnme: {
            type: Sequelize.STRING(255),
            allowNull: false
        },
        prfldolddta: {
            type: Sequelize.TEXT
        },
        prfldnewdta: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        praction: {
            type: Sequelize.STRING(1),
            allowNull: false
        },
        prmntusr: {
            type: Sequelize.STRING(255),
            allowNull: false
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    fields: ['prmntfile', 'prmntkey']
                }
            ]
        });

    return mntlogpf;
};