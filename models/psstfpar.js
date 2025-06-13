module.exports = (sequelize, Sequelize) => {
  const psstfpar = sequelize.define("psstfpar", {
    psstfuid: {
      type: Sequelize.STRING(25),
      allowNull: false,
      primaryKey: true,
      // Staff ID (e.g., MS0001, CS0001, AS0001)
      comment: 'Staff Id'
    },
    psstfnme: {
      type: Sequelize.STRING(255),
      allowNull: true,
      // First Name
      comment: 'First Name'
    },
    psmrcuid: {
      type: Sequelize.STRING(25),
      allowNull: true,
      // Linked Merchant ID (required if staffType != A or O)
      comment: 'Merchant Id'
    },
    psstftyp: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // A - Admin, S - Staff, O - Owner
      comment: 'Staff Type'
    },
    psstfidt: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // IC or PS
      comment: 'ID Type'
    },
    psstfidn: {
      type: Sequelize.STRING(25),
      allowNull: false,
      // ID Number
      comment: 'ID No.'
    },
    psstfprp: {
      type: Sequelize.STRING(255),
      allowNull: true,
      // Profile Picture path
      comment: 'Profile Picture'
    },
    psstfnat: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // MY, MM, VN, ID, PK
      comment: 'Nationality'
    },
    psstfsdt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
      // System Status Date
      comment: 'Status Date'
    },
    psstfjdt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
      // Join Date
      comment: 'Join Date'
    },
    psstfsts: {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'Y',
      // Y or N
      comment: 'Staff Status'
    },
    psstfad1: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Current Address Line 1'
    },
    psstfad2: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Current Address Line 2'
    },
    psstfpos: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Current Postcode'
    },
    psstfcit: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Current City'
    },
    psstfsta: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Current State'
    },
    psstfchp: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'CurrentHp'
    },
    psstfsam: {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'N',
      // Y or N
      comment: 'Same Address'
    },
    psstfha1: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Home Address Line 1'
    },
    psstfha2: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Home Address Line 2'
    },
    psstfhpo: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Home Postcode'
    },
    psstfhci: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Home City'
    },
    psstfhst: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Home State'
    },
    psstfeml: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Email Address'
    },
    psstfbnk: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // HLBB, MBB, CIMB, PBB
      comment: 'Bank Name'
    },
    psstfacc: {
      type: Sequelize.STRING(25),
      allowNull: false,
      validate: {
        isNumeric: true
      },
      comment: 'Bank Account No'
    },
    psstfbnm: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Bank Account User Name'
    },
    psstfepr: {
      type: Sequelize.STRING(10),
      allowNull: false,
      // MY, US, CN, SG
      comment: 'Emergency Contact Prefix'
    },
    psstfehp: {
      type: Sequelize.STRING(25),
      allowNull: false,
      comment: 'Emergency Contact'
    },
    psusrunm: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Username'
    },
    crtuser: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Create User'
    },
    mntuser: {
      type: Sequelize.STRING(255)
      // Maintenance User
    }
  }, {
    freezeTableName: true,
    tableName: 'psstfpar',
    timestamps: true
  });

  return psstfpar;
};
