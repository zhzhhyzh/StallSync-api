// System Parameter

module.exports = (sequelize, Sequelize) => {
  const pssyspar = sequelize.define("pssyspar", {
    pscomnme: {
      type: Sequelize.STRING(255),
      defaultValue: ""
      // Company Name
    },
    pscomidn: {
      type: Sequelize.STRING(255),
      defaultValue: ""
      // Company ID Number
    },
    prpwdpol: {
      type: Sequelize.STRING(1),
      defaultValue: "N"
      // Password Policy Indicator (YESORNO)
    },
    pslotime: {
      type: Sequelize.INTEGER,
      defaultValue: 300
      // Auto Logout timer(Seconds)
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Last Maint User
    }
  }, { freezeTableName: true },
    {
    });

  return pssyspar;
};