"use strict";

/** Shared config for application; can be required many places. */

require("colors");

const {name, version } = require('./package.json')
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;
const OPEN_AI_KEY = process.env.OPEN_AI_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const UNSPLASH_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "autoblogger_test"
      : process.env.DATABASE_URL || "autoblogger";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;




console.log("==============================");
console.log(`${name} Version ${version}`)
console.log("--Config--".green);
console.log("NODE_ENV:".yellow, NODE_ENV);
console.log("SECRET_KEY:".red, SECRET_KEY);
console.log("UNSPLASH CLIENT ID:".yellow, UNSPLASH_CLIENT_ID);
console.log("OPEN_AI_KEY:".red, OPEN_AI_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("==============================");


module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  OPEN_AI_KEY,
  ANTHROPIC_KEY,
  UNSPLASH_CLIENT_ID,
  getDatabaseUri,
  devConfig: {
    name,
    version,
    database:{
      options:{
        host:'localhost',
        port:'5432',
        database: getDatabaseUri(),
        dialect: 'postgres',
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD
      },
      client:null

    }
  }
};
