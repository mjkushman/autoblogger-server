// const Sequelize = require("sequelize");
// const { devConfig } = require("./config");

// // console.dir(devConfig);

// const sequelize = new Sequelize(devConfig.database.options);

// function connectToDb() {
//   sequelize
//     .authenticate()
//     .then(() => {
//       console.log("Connection to database was successful");
//     })
//     .catch((error) => {
//       console.log("Unable to connect to database", error);
//       process.exit(1);
//     });
//   return sequelize;
// }

// const postgresClient = connectToDb()
// // This is just to help me console log the results
// // console.log('POSTGRES CLIENT:',postgresClient)

// devConfig.database.client = postgresClient; 
// // console.log('DATABASE CONFIG:')
// // console.dir(devConfig.database);

// const db = connectToDb();
// // console.dir(devConfig);

// module.exports = db;
