// Table Key Master 

module.exports = (sequelize, Sequelize) => {
    const pstblkey = sequelize.define("pstblkey", {
        pstblnme: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Table Name
        },
        pstblkyn: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Table Key Name
        },
        pstblkys: {
            type: Sequelize.INTEGER,
            defaultValue: 1
            // Table Key Sequence Number
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
                    fields: ['pstblnme', 'pstblkyn']
                }
            ]
        });

    return pstblkey;
};
