const Sequelize = require("sequelize");
const { devConfig } = require("./config");


console.dir(devConfig)
async function connectToDb() {
  const sequelize = new Sequelize(devConfig.database.options);
  try {
    devConfig.database.client = await sequelize.authenticate()
    console.log("Connection to database was successful");
    console.dir(devConfig)
    return sequelize;
  } catch (error) {
    console.log("Unable to connect to database");
  }
}

let dborm = connectToDb();


module.exports = dborm;
