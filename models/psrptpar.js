//Report

module.exports = (sequelize, Sequelize) => {
  const psrptpar = sequelize.define("psrptpar", {
    psrptuid: {
        type: Sequelize.STRING(50),
        allowNull: false,
        // Report ID
    },
    psrptnme: {
        type: Sequelize.STRING(255),
        allowNull: false,
        // Report Name
    },
    psrpttyp: {
        type: Sequelize.STRING(255),
        allowNull: false,
        // Report Type
    },
    psmrcuid: {
        type: Sequelize.STRING(25),
        allowNull: false,
        // Merchant ID
    },
    psrptpat: {
        type: Sequelize.STRING(255),
        allowNull: false,
        // Report Path
    },
    psrptdat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: new Date(),
        // Report Date
    },
    psrptifc: {
        type: Sequelize.STRING(255),
        allowNull: false,
        // Forecast Indicator
    },
    psrptfcp: {
        type: Sequelize.STRING(255),
        allowNull: true,
        // Forecast Path
    },
    crtuser: {
        type: Sequelize.STRING(255),
        allowNull: true,
        // Create User
    },
    mntuser: {
        type: Sequelize.STRING(255),
        allowNull: true,
        // Maintenance User
    }
}, {freezeTableName: True},
{
    indexes: [
        {
            unique: true,
            fields: ['psrptuid']
        }
    ]
});

  return psrptpar;
}