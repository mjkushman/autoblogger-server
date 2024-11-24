export type Config = {
  name: string;
  version: number;
  majorVersion: number;
  database: {
    options: {
      host: string;
      port: string;
      database: string;
      dialect: string;
      username: string;
      password: string;
    };
    client: null;
  };
  SECRET_KEY: string;
  PORT: number;
  BCRYPT_WORK_FACTOR: number;
  OPENAI_API_KEY: string;
  ANTHROPIC_KEY: string;
  UNSPLASH_CLIENT_ID: string;
};
