// General Code Parameter

module.exports = (sequelize, Sequelize) => {
  const prgencde = sequelize.define("prgencde", {
    prgtycde: {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: 'unique_key'
      // General Type
    },
    prgecode: {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: 'unique_key'
      // General Code
    },
    prgedesc: {
      type: Sequelize.STRING(50),
      allowNull: false
      // General Code Description
    },
    prgeldes: {
      type: Sequelize.STRING(50)
      // General Code Local Description
    },
    crtuser : {
      type: Sequelize.STRING(255)
      // Creation User
    },
    mntuser : {
      type: Sequelize.STRING(255)
      // Maintenance User
    }
  }, { freezeTableName: true },
    {
      uniqueKeys: {
        unique_key: {
          fields: [
              'prgtycde',
              'prgecode'
          ]
        }
      },
      indexes: [
        {
          unique: true,
          fields: [
              'prgtycde',
              'prgecode'
          ]
        }
      ]
    });

  return prgencde;
};