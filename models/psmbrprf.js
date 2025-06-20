// Member Profile

module.exports = (sequelize, Sequelize) => {
  const psmbrprf = sequelize.define("psmbrprf", {
    psmbruid: {
      type: Sequelize.STRING(25),
      allowNull: false
      // Member ID
    },
    psmbrnam: {
      type: Sequelize.STRING(255),
      allowNull: false
      // Name
    },
    psmbreml: {
      type: Sequelize.STRING(255),
      allowNull: false,
      // Email Address
    },
    psmbrdob: {
      type: Sequelize.DATE,
      allowNull: false,
      // Date of Birth
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
    psmbrtyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // Member Type
    },
    psmbrexp: {
      type: Sequelize.DATE,
      allowNull: false,
      // Expired Date
    },
    psmbrjdt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(),
      // join Date
    },
    psmbrcar: {
      type: Sequelize.STRING(50),
      allowNull: false,
      //Member Cart no
    },
    psusrnme: {
      type: Sequelize.STRING(20),
      allowNull: false,
      //Username
    },
    psmbrpre: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Phone Number Prefix
    },
    psmbrphn: {
      type: Sequelize.STRING(25),
      allowNull: false
      // Phone Number 
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