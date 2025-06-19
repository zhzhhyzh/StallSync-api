// Order Item

module.exports = (sequelize, Sequelize) => {
  const psrwddtl = sequelize.define("psrwddtl", {
    psrwduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Order Id
    },
    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Merchant Id
    },

  }, { freezeTableName: true },
    {

      indexes: [
        {
          unique: true,
          fields: ['psrwduid', 'psmrcuid']
        }
      ]
    });

  return psrwddtl;
};
