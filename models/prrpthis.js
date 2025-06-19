// Reporting History

module.exports = (sequelize, Sequelize) => {
  const prrpthis = sequelize.define("prrpthis", {
    prrptnme: {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true
      // Report File Name
    },

    prrptgdt: {
      type: Sequelize.DATE,
      defaultValue: new Date()
      // Report Generated Date
    },
    prrptsts: {
      type: Sequelize.STRING(1),
      // Report Status - Gencode (RPTSTS)
    },
    prrptusr: {
      type: Sequelize.STRING(50),
      allowNull: false
      // Generated User
    },
    prrptmch: {
      type: Sequelize.STRING(50),
      allowNull: false
      // Generated Merchant
    },
    prrptfcs: {
      type: Sequelize.STRING(1),
      allowNull: false,
      defaultValue: "N"
      // Is Forecasted Sales
    },
    prrptfco: {
      type: Sequelize.STRING(1),
      allowNull: false,
      defaultValue: "N"
      // Is Forecasted Order Counts
    },
    prcrtusr: {
      type: Sequelize.STRING(255)
      // Creation User
    },
    prmntusr: {
      type: Sequelize.STRING(255)
      // Maintenance User
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['prrptnme']
        }
      ]
    });

  return prrpthis;
};