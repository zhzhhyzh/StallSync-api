//Reward Parameter

module.exports = (sequelize, Sequelize) => {
  const psrwdpar = sequelize.define("psrwdpar", {
    psrwduid: {
      type: Sequelize.STRING(10),
      allowNull: false,
      primaryKey: true,
      comment: "Reward ID"
    },
    psrwdnme: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Reward Name"
    },
    psrwddsc: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Reward Description"
    },
    psrwdlds: {
      type: Sequelize.STRING(255),
      comment: "Reward Local Description"
    },
    psrwdfdt: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: "From Date"
    },
    psrwdtdt: {
      type: Sequelize.DATE,
      allowNull: false,
      comment: "To Date"
    },
    psrwdtyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Discount Type (DISTYPE)"
    },
    psrwddva: {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false,
      comment: "Discount Value"
    },
    psrwdism: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "N",
      comment: "Min Indicator (YES/NO)"
    },
    psrwdmin: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Min Amount"
    },
    psrwdica: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "N",
      comment: "Capped Indicator (YES/NO)"
    },
    psrwdcap: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Capped Amount"
    },
    psrwdaam: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "Y",
      comment: "Applicable to All Merchant (YES/NO)"
    },
    psrwdsts: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "I",
      comment: "Reward Status"
    },
    psrwdqty: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "Quantity"
    },
    crtuser: {
      type: Sequelize.STRING(255),
      comment: "Create User"
    },
    mntuser: {
      type: Sequelize.STRING(255),
      comment: "Maintenance User"
    }
  }, {
    freezeTableName: true,
    tableName: "psrwdpar",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['psrwduid']
      }
    ]
  });

  return psrwdpar;
};
