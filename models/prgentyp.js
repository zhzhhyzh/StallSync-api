// General Type Paramater

module.exports = (sequelize, Sequelize) => {
  const prgentyp = sequelize.define("prgentyp", {
    prgtycde: {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: 'unique_key'
      // General Type Code
    },
    prgtydsc: {
      type: Sequelize.STRING(50),
      allowNull: false
      // General Type Code Description
    },
    prgtylds: {
      type: Sequelize.STRING(50)
      // General Type Code Local Description
    },
    prgtylen: {
      type: Sequelize.INTEGER
      // General Type Length -- maximum up to 10 only
    },
    prgtyman: {
      type: Sequelize.STRING(1)
      // Mandatory
    },
    prgtycat: {
      type: Sequelize.STRING(1)
      // Category
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
      uniqueKeys: {
        unique_key: {
            fields: [
                'prgtycde'
            ]
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['prgtycde']
        }
      ]
    });

  return prgentyp;
};