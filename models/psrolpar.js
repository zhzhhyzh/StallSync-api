// Role Paramater

module.exports = (sequelize, Sequelize) => {
    const psrolpar = sequelize.define("psrolpar", {
      psrolcde: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: 'unique_key'
        // Role Code
      },
      psroldsc: {
        type: Sequelize.STRING(255),
        allowNull: false
        // Role Description
      },
      psrollds: {
        type: Sequelize.STRING(255),
        default: '',
        // Role Local Description
      },
      psrolibi: {
        type: Sequelize.STRING(10),
        default: ''
        // Interbranch Data Inquiry (YESORNO)
      },
      psrolibm: {
        type: Sequelize.STRING(10),
        default: ""
        // Interbranch Data Maintenance (YESORNO)
      },
  
      crtuser: {
        type: Sequelize.STRING(25)
        // Creation User
      },
      mntuser: {
        type: Sequelize.STRING(25)
        // Maintenance User
      }
    }, { freezeTableName: true },
      {
        uniqueKeys: {
          unique_key: {
            fields: [
              'psrolcde'
            ]
          }
        },
        indexes: [
          {
            unique: true,
            fields: ['psrolcde']
          }
        ]
      });
  
    return psrolpar;
  };
  