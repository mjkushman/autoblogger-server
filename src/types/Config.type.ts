import { Options } from "sequelize";

export type Config = {
  name: string;
  version: number;
  majorVersion: number;
  NODE_ENV: string | undefined;
  database: {
    connectionUrl: string;
    options: Options;
    client: null;
  };
  JWT_SECRET: string;
  PORT: number;
  BCRYPT_WORK_FACTOR: number;
  OPENAI_API_KEY: string;
  UNSPLASH_CLIENT_ID: string;
};
