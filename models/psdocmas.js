// Document Master File

module.exports = (sequelize, Sequelize) => {
  const psdocmas = sequelize.define("psdocmas", {
    psdocfnm: {
      type: Sequelize.STRING(100),
      allowNull: false
      // Document File Name
    },
    psdoconm: {
      type: Sequelize.STRING(255),
      allowNull: false,
      // Original File Name
    },
    psdocudt: {
      type: Sequelize.DATE,
      defaultValue: new Date()
      // Upload Date
    },
    psdoctyp: {
      type: Sequelize.STRING(10),
      defaultValue: "1"
      // Document Path (1: temp_document, 2: store_front_image, 3: store_profile_picture_image)
    },
    psdocext: {
      type: Sequelize.STRING(255),
      defaultValue: ""
      // Document Extension
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: [
            'psdocfnm'
          ]
        }
      ]
    });

  return psdocmas;
};