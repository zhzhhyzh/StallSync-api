// Access Parameter

module.exports = (sequelize, Sequelize) => {
  const prfunacs = sequelize.define("prfunacs", {
    pracsfun: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Function Code
    },
    pracsrol: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Role Code
    },
    pracssts: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
      // Access Status 
    },
    pracsa01: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 01 
    },
    pracsa02: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 02
    },
    pracsa03: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 03 
    },
    pracsa04: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 04 
    },
    pracsa05: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 05
    },
    pracsa06: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 06 
    },
    pracsa07: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 07 
    },
    pracsa08: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 08
    },
    pracsa09: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 09 
    },
    pracsa10: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 10 
    },
    crtuser: {
      type: Sequelize.STRING(255)
      // Creation User
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Maintenance User
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['pracsfun', 'pracsrol']
        }
      ]
    });

  return prfunacs;
};