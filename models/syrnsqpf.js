// Ssytem Running Number

module.exports = (sequelize, Sequelize) => {
    const syrnsqpf = sequelize.define("syrnsqpf", {
        type: {
            type: Sequelize.STRING(3),
            allowNull: false
        },
        current: {
            type: Sequelize.STRING(11),
            allowNull: false
        }
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['type']
                }
            ]
        });

    return syrnsqpf;
};