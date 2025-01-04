"use strict";

/** Shared config for application; can be required many places. */
import dotenv from "dotenv";

dotenv.config();

import "colors";

const version = 1;
const majorVersion = 1;
const name = "Autoblogger";
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = +process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const UNSPLASH_CLIENT_ID = process.env.UNSPLASH_CLIENT_ID;
const NODE_ENV = process.env.NODE_ENV;

// Use dev database, testing database, or via env var, production database
const getDatabaseUri = (): string => {
  return process.env.NODE_ENV === "test"
    ? "autoblogger_test"
    : process.env.DATABASE_URL;
};

const getDialectOptions = () => {
  if (NODE_ENV === "production") {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  } else {
    return {};
  }
};

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("==============================");
console.log(`${name} Version ${version} Major Version ${majorVersion}`);
console.log("--Config--".green);
console.log("NODE_ENV:".yellow, NODE_ENV);
console.log("JWT_SECRET:".red, JWT_SECRET);
console.log("UNSPLASH CLIENT ID:".yellow, UNSPLASH_CLIENT_ID);
console.log("OPENAI_API_KEY:".red, OPENAI_API_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database connection string:".yellow, getDatabaseUri());
console.log(
  "Database dialect options:".yellow,
  JSON.stringify(getDialectOptions())
);

console.log("==============================");

const config = {
  name,
  version,
  majorVersion,
  NODE_ENV,
  database: {
    connectionUrl: getDatabaseUri(),
    options: {
      dialect: "postgres",
      logging: false,
      dialectOptions: getDialectOptions(),
    },
    client: null,
  },
  JWT_SECRET,
  PORT,
  BCRYPT_WORK_FACTOR,
  OPENAI_API_KEY,
  ANTHROPIC_KEY,
  UNSPLASH_CLIENT_ID,
};

// export default configs[NODE_ENV];
export default config;
