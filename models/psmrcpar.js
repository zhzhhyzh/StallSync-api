// Merchant Parameter

module.exports = (sequelize, Sequelize) => {
  const psmrcpar = sequelize.define("psmrcpar", {
    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      primaryKey: true, 
      comment: "Merchant ID"
    },
    psmrcnme: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Merchant Name"
    },
    psmrcdsc: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Merchant Description"
    },
    psmrclds: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Merchant Local Description"
    },
    psmrcsdt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: new Date(),
      comment: "Status Date"
    },
    psmrcjdt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: new Date(),
      comment: "Join Date"
    },
    psmrcown: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Merchant Owner"
    },
    psmrcssm: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "SSM No"
    },
    psmrcssc: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "SSM Cert Image"
    },
    psmrcsts: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Merchant Status (YESORNO)"
    },
    psmrcbnk: {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: "Merchant Bank"
    },
    psmrcacc: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: "Merchant Bank Account"
    },
    psmbrbnm: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: "Merchant Bank Name"
    },
    psmrcsfi: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Store Front Image"
    },
    psmrcppi: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: "Profile Picture Image"
    },
    psmrcrtg: {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
      comment: "Rating"
    },
    psmrcrmk: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Remarks"
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
          fields: ['psmrcuid']
        }
      ]
    });

  return psmrcpar;
};