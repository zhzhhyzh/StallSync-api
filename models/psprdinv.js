module.exports = (sequelize, Sequelize) => {
  const psprdinv = sequelize.define("psprdinv", {
    psprduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Product ID"
    },
    psinvsty: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Stock Type (STKTYP)"
    },
    psinvqty: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: "Quantity"
    },
    psinvsdt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Stock Date"
    },
    crtuser: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Create User"
    },
    mntuser: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Maintenance User"
    }
  }, {
    tableName: 'psprdinv',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['psprduid', 'psinvsdt', 'psinvsty']
      }
    ]
  });

  return psprdinv;
};
