// Table Master 

module.exports = (sequelize, Sequelize) => {
    const pstblmas = sequelize.define("pstblmas", {
        pstblnme: {
            type: Sequelize.STRING(25),
            allowNull: false
            // Table Name
        },
        pstbltyp: {
            type: Sequelize.STRING(10),
            allowNull: false
            // Table Type (TBLTYPE: P - Parameter, F - Functional)
        },
        pstbldsc: {
            type: Sequelize.STRING(255),
            allowNull: false
            // Table Description
        },
        pstbllds: {
            type: Sequelize.STRING(255),
            defaultValue: ""
            // Table Local Description
        },
        pstblpnt: {
            type: Sequelize.STRING(25),
            defaultValue: ''
            // Table Parent
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
                    fields: ['pstblnme']
                }
            ]
        });

    return pstblmas;
};
