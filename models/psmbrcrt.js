//Cart Table

module.exports = (sequelize, Sequelize) => {
    
    const psmbrcrt = sequelize.define('psmbrcrt', {
        psmbrcar: {
            type: Sequelize.STRING(50),
            allowNull: false,
            // Cart ID
        },
        psitmcno: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // Cart Increment Number
        },
        psmrcuid: {
            type: Sequelize.STRING(25),
            allowNull: false,
            // Merchant ID
        },
        psprduid: {
            type: Sequelize.STRING(25),
            allowNull: false,
            // Product ID
        },
        psitmqty: {
            type: Sequelize.INTEGER,
            allowNull: false,
            // Cart Item Quantity
        },
        // psitmdsc: {
        //     type: Sequelize.STRING(255),
        //     allowNull: false,
        //     // Add On Description
        // },
        psitmunt: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            // Unit Price
        },
        psitmsbt: {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: false,
            // Subtotal
        },
        psitmrmk: {
            type: Sequelize.TEXT,
            defaultValue: '',
            // Cart Item Remarks
        },
    }, { freezeTableName: true },
        {
            indexes: [
                {
                    unique: true,
                    fields: ['psmbrcar', 'psmrcuid', 'psitmcno']
                }
            ]
        });

        psmbrcrt.associate = (models) => {
  psmbrcrt.belongsTo(models.psprdpar, {
    foreignKey: "psprduid",
    as: "product",
  });
};

    return psmbrcrt;
};  