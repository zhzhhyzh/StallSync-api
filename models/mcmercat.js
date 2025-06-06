// Merchant Catalogue

module.exports = (sequelize, Sequelize) => {
  const mcmercat = sequelize.define("mcmercat", {
    psmchuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // Merchant ID
    },
    pscatgrp: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Catalogue Item Group (ITEMGRP)
    },
    pscattyp: {
      type: Sequelize.STRING(10),
      allowNull: false
      // Catalogue Item Type (ITEMTYP)
    },
    pscatidn: {
      type: Sequelize.STRING(25),
      allowNull: false
      // Catalogue Item Code
    },
    pscatsqn: {
      type: Sequelize.INTEGER,
      allowNull: false
      // Catalogue Item Sequence
    },
    pscatnme: {
      type: Sequelize.STRING,
      allowNull: false
      // Catalogue Item Name
    },
    pscatdsc: {
      type: Sequelize.STRING,
      allowNull: false
      // Catalogue Item Description
    },
    pscatpri: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
      // Catalogue Item price
    },
    pscatmst: {
      type: Sequelize.STRING(10),
      defaultValue: ""
      // Measurement Unit
    },
    pscatimg: {
      type: Sequelize.STRING,
      defaultValue: ""
      // Catalogue Item Image
    },
    pscatnm2: {
      type: Sequelize.STRING,
      defaultValue: ""
      // Catalogue Item Name 2
    },
    pscatds2: {
      type: Sequelize.STRING,
      defaultValue: ""
      // Catalogue Item Description 2
    },
    pscatdst: {
      type: Sequelize.STRING(1),
      defaultValue: "N"
      // Catalogue Item Discount? (YESORNO)
    },
    pscatdsp: {
      type: Sequelize.DECIMAL(15, 2)
      // Catalogue Item Discounted Price
    },
    pscatsts: {
      type: Sequelize.STRING(1),
      defaultValue: "Y"
      // Catalogue Item Status (YESORNO)
    },
    pscatrec: {
      type: Sequelize.STRING(1),
      defaultValue: ""
      // Catalogue Item Recommendation Type (RECTYPE)
    },
    pscatnpr: {
      type: Sequelize.STRING(1),
      defaultValue: "N"
      // Catalogue Item Seasonal Price Indicator (YESORNO)
    },
    crtuser: {
      type: Sequelize.STRING(255)
      // Creation User
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Last Maint User
    }
  }, { freezeTableName: true },
    {
      indexes: [
        {
          unique: true,
          fields: ['psmchuid', 'pscatidn']
        }
      ]
    });

  return mcmercat;
};