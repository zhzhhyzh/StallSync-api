// Merchant Label

module.exports = (sequelize, Sequelize) => {
  const psmrclbl = sequelize.define("psmrclbl", {
    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      primaryKey: true, 
      comment: "Merchant ID"
    },
    psmrctyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Merchant Type"
    },
   
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['psmrcuid', 'psmrctyp']
        }
      ]
    });

  return psmrclbl;
};