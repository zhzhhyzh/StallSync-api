module.exports = (sequelize, Sequelize) => {
  const psmrclbl = sequelize.define("psmrclbl", {
    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Merchant ID"
    },
    psmrctyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Merchant Type"
    },
  }, {
    freezeTableName: true,
    timestamps: true,
    primaryKey: false, // Not needed here
    indexes: [
      {
        unique: true,
        fields: ['psmrcuid', 'psmrctyp']
      }
    ]
  });

  return psmrclbl;
};
