// Order Review

module.exports = (sequelize, Sequelize) => {

    const psordrvw = sequelize.define('psordrvw', {
        psorduid: {
            type: Sequelize.STRING(25),
            allowNull: false,
            // Order ID
        },
        psrvwimg: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Review Image
        },
        psrvwvid: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Review Video
        },
        psrvwrtg: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // defaultValue: 5,
            // Rating
        },
        psrvwdsc: {
            type: Sequelize.STRING(255),
            allowNull: false,
            // Review Description
        },
        crtuser: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Create User
        },
        mntuser: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Maintenance User
        },
    }, {
        timestamps: true,
        freezeTableName: true,
        tableName: 'psordrvw'
    },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psorduid']
                }
            ]
        });

    return psordrvw;
}