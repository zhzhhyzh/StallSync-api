// Merchant Master File

module.exports = (sequelize, Sequelize) => {
  const mcmaster = sequelize.define("mcmaster", {
    psmchuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Merchant ID
    },
    psmchnme: {
      type: Sequelize.STRING,
      allowNull: false
      // Merchant Name
    },
    psmchadr: {
      type: Sequelize.TEXT,
      allowNull: false
      // Merchant Address
    },
    psmchsta: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Merchant State
    },
    psmchcty: {
      type: Sequelize.STRING(50),
      allowNull: false
      // Merchant City
    },
    psmchcnt: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Merchant Country
    },
    psmchzip: {
      type: Sequelize.STRING(5),
      allowNull: false
      // Merchant Zip Code
    },
    psmchrmk: {
      type: Sequelize.TEXT,
      allowNull: false
      // Merchant Additional Remarks
    },
    psmchphn: {
      type: Sequelize.STRING(50),
      allowNull: false
      // Merchant Phone Number
    },
    psmchsts: {
      type: Sequelize.STRING(1),
      defaultValue: "Y"
      // Merchant Status (YESORNO)
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
          fields: ['psmchuid', 'psmchnme']
        }
      ]
    });

  return mcmaster;
};