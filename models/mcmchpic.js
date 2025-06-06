// Merchant Person In Charge

module.exports = (sequelize, Sequelize) => {
  const mcmchpic = sequelize.define("mcmchpic", {
    psmchuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Merchant ID
    },
    psconnam: {
      type: Sequelize.STRING,
      allowNull: false
      // PIC Name
    },
    psconeml: {
      type: Sequelize.STRING,
      allowNull: false
      // PIC Email
    },
    psconphn: {
      type: Sequelize.STRING(50),
      allowNull: false
      // PIC Phone Number
    },
    psconunm: {
      type: Sequelize.STRING(50),
      allowNull: false
      // PIC Username
    },
    psconsts: {
      type: Sequelize.STRING(1),
      defaultValue: "A"
      // PIC Status
    },
    crtuser: {
      type: Sequelize.STRING(255)
      // Creation User
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Last Maint User
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['psmchuid', 'psconunm']
        }
      ]
    });

  return mcmchpic;
};