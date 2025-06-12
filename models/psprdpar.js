module.exports = (sequelize, Sequelize) => {
  const psprdpar = sequelize.define("psprdpar", {
    psprduid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      primaryKey: true,
      comment: "Product ID"
    },
    psprdnme: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Product Name"
    },
    psprddsc: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Product Description"
    },
    psprdlds: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Product Local Description"
    },
    psprdimg: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Product Image"
    },

    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Merchant ID"
    },
    psprdtyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Product Type (PRODTYP)"
    },
    psprdcat: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Product Category (PRODCAT)"
    },
    psprdfvg: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'N',
      comment: "For Vegetarian (YESORNO)"
    },
    psprdhal: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'N',
      comment: "Is Halal (YESORNO)"
    },
    psprdsts: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'A',
      comment: "Product Status (PRODSTS)"
    },
    psprdsdt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Status Date"
    },
    psprdcid: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'N',
      comment: "Countable Indicator (YESORNO)"
    },
    psprdlsr: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 10,
      comment: "Low Stock Reminder"
    },
    psprdstk: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Stock"
    },
    psprdpri: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "Discount Price"
    },
    psprdddt: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Discount Date"
    },
    psprddva: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: "Discount Value"
    },
    psprdcrd: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      comment: "Creation Date"
    },
    psprdrmk: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Remarks"
    },
    psprdrtg: {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0,
      comment: "Rating"
    },
    crtuser: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Create User'
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Last Maint User
    }
  }, {
    freezeTableName: true,
    tableName: 'psprdpar',
    timestamps: false
  });

  return psprdpar;
};
