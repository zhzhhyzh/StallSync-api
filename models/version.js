// General Type Paramater

module.exports = (sequelize, Sequelize) => {
  const version = sequelize.define("version", {
    version: {
      type: Sequelize.STRING(10),
      defaultValue: '1.0.0'
      // Version
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['version']
        }
      ]
    });

  return version;
};