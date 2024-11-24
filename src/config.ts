"use strict";

/** Shared config for application; can be required many places. */
import dotenv from"dotenv";
dotenv.config();

import "colors";
import { Config } from "./types/Config.type";

const version = 1
const majorVersion = 1
const name = "Autoblogger"
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const UNSPLASH_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD

// Use dev database, testing database, or via env var, production database
function getDatabaseUri(): string {
  return (process.env.NODE_ENV === "test")
      ? "autoblogger_test"
      : process.env.DATABASE_URL || "autoblogger";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;


console.log("==============================");
console.log(`${name} Version ${version} Major Version ${majorVersion}`)
console.log("--Config--".green);
console.log("NODE_ENV:".yellow, NODE_ENV);
console.log("SECRET_KEY:".red, SECRET_KEY);
console.log("UNSPLASH CLIENT ID:".yellow, UNSPLASH_CLIENT_ID);
console.log("OPENAI_API_KEY:".red, OPENAI_API_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("Database User:".yellow, DATABASE_USERNAME);
console.log("==============================");


const configs: { [key: string]: Config } = {
  development: {
    name,
    version,
    majorVersion,
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
    },
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    OPENAI_API_KEY,
    ANTHROPIC_KEY,
    UNSPLASH_CLIENT_ID,
  },
  testing:{
    name,
    version,
    majorVersion,
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
    },
    SECRET_KEY,
    PORT,
    BCRYPT_WORK_FACTOR,
    OPENAI_API_KEY,
    ANTHROPIC_KEY,
    UNSPLASH_CLIENT_ID,
  }
};

export default configs[NODE_ENV]