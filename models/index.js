const sequelize = require("../config/database");
const User = require("./User");

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error("Error syncing database:", error);
    }
};

module.exports = { sequelize, User, syncDatabase };
