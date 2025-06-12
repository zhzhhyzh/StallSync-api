// Role Parameter

module.exports = (sequelize, Sequelize) => {
  const psprddtl = sequelize.define("psprddtl", {
    psprduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Product ID"
    },
    psprdapn: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Add On Product Name"
    },
    psprdaty: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Add On Type"
    },
    psprdmnd: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Mandatory Indicator"
    },
    psprdpri: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price"
    }
  }, {
    freezeTableName: true,
    uniqueKeys: {
      unique_key: {
        fields: ['psprduid', 'psprdapn']
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['psprduid', 'psprdapn']
      }
    ]
  });

  return psprddtl;
};
