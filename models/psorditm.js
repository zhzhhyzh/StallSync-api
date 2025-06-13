// Order Item

module.exports = (sequelize, Sequelize) => {
  const psorditm = sequelize.define("psorditm", {
    psorduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Order Id
    },
    psprduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Product Id
    },
    psitmqty: {
      type: Sequelize.INTEGER,
      allowNull: false
      , defaultValue: 1,
      // Order Item Quantity
    },
    psitmrmk: {
      type: Sequelize.TEXT,
      default: '',
      // Order Item Remark
    },

    psitmdsc: {
      type: Sequelize.STRING(255),
      allowNull: false
      // Order Item Description
    },
    psitmunt: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      // Unit Price
    },
    psitmsbt: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      // Subtotal
    }, psitmcno: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // Increment Number
    }
  }, { freezeTableName: true },
    {

      indexes: [
        {
          unique: true,
          fields: ['psorduid', 'psprduid', 'psitmcno']
        }
      ]
    });

  return psorditm;
};
