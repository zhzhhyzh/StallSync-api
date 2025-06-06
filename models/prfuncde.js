// Function Code Parameter

module.exports = (sequelize, Sequelize) => {
  const prfuncde = sequelize.define("prfuncde", {
    prfuncde: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Function Code
    },
    prfunnme: {
      type: Sequelize.STRING(100),
      allowNull: false
      // Function Name
    },
    prfunlnm: {
      type: Sequelize.STRING(100)
      // Function Local Name
    },
    prfunsts: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
      // Function Status 
    },
    prfungrp: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Function Group
    },
    prfuna01: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Actions Object
    },
    prfuna02: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 02
    },
    prfuna03: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 03 
    },
    prfuna04: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 04 
    },
    prfuna05: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 05
    },
    prfuna06: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 06 
    },
    prfuna07: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 07 
    },
    prfuna08: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 08
    },
    prfuna09: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 09 
    },
    prfuna10: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
      // Action - 10 
    },
    prfunl01: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 01 
    },
    prfunl02: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 02 
    },
    prfunl03: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 03 
    },
    prfunl04: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 04 
    },
    prfunl05: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 05 
    },
    prfunl06: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 06 
    },
    prfunl07: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 07 
    },
    prfunl08: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 08 
    },
    prfunl09: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 09
    },
    prfunl10: {
      type: Sequelize.STRING(10),
      defaultValue: ''
      // Label - 10 
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
          fields: ['prfuncde']
        }
      ]
    });

  return prfuncde;
};