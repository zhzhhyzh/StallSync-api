// Review

module.exports = (sequelize, Sequelize) => {

    const psodrrvw = sequelize.define('psodrrvw', {
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
        crtusr: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Create User
        },
        mntusr: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // Maintenance User
        },
    }, {
        timestamps: true,
        freezeTableName: true,
        tableName: 'psodrrvw'
    },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psorduid']
                }
            ]
        });

    return psodrrvw;
}