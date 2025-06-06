// Member Profile

module.exports = (sequelize, Sequelize) => {
  const psmbrprf = sequelize.define("psmbrprf", {
    psmbruid: {
      type: Sequelize.STRING(25),
      allowNull: false
      // Member ID
    },
    psmbrnam: {
      type: Sequelize.STRING(50),
      allowNull: false
      // Name
    },
    psmbrphp: {
      type: Sequelize.STRING(5),
      allowNull: false
      // Phone Number Prefix. E.g. +60 (PHNPRE)
    },
    psmbrphn: {
      type: Sequelize.STRING(30),
      allowNull: false
      // Phone Number (RAW)
    },
    psmbrpnm: {
      type: Sequelize.STRING(20),
      allowNull: false
      // Phone Number (Number Part)
    },
    psmbreml: {
      type: Sequelize.STRING(255),
      allowNull: false,
      // Email Address
    },
    psmbrdob: {
      type: Sequelize.STRING(15),
      allowNull: false,
      // Date of Birth
    },
    psmbrtyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // Member Type
    },
    psmbrpts: {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
      // Member Point Balance
    },
    psmbracs: {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
      // Member Accumulated Spending
    },
    psmbrsts: {
      type: Sequelize.STRING(1),
      defaultValue: "A"
      // Account Status - General Code (USRSTS: A - Active, L - Locked , C - Closed, E - Expired)
    },

    psmbrprl: {
      type: Sequelize.STRING(10),
      defaultValue: "ZH"
      // Member Preferred Language
    },
    psmbrcar: {
      type: Sequelize.STRING(50),
      allowNull:false,
      //Member Cart no
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
          fields: ['psmbruid']
        }
      ]
    });

  return psmbrprf;
};