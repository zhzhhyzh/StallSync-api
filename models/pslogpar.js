// Logging Parameter

module.exports = (sequelize, Sequelize) => {
  const pslogpar = sequelize.define("pslogpar", {
    pslogcde: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Log Code
    },
    pslogdsc: {
      type: Sequelize.STRING(255),
      allowNull: false,
      // Log Description
    },
    pslogmax: {
      type: Sequelize.INTEGER,
      defaultValue: 10
      // Log Maximum File Size - in MB
    },
    pslogcpy: {
      type: Sequelize.INTEGER,
      defaultValue: 10
      // Log Copies
    },
    pslogpth: {
      type: Sequelize.STRING(255),
      allowNull: false
      // Log File Path
    },
    pslogfnm: {
      type: Sequelize.STRING(255),
      allowNull: false
      // Log File Name
    },
    crtuser: {
      type: Sequelize.STRING(1)
      // Creation User
    },
    mntuser: {
      type: Sequelize.STRING(1)
      // Last Maint User
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['pslogcde']
        }
      ]
    });

  return pslogpar;
};