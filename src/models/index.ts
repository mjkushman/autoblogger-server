import config from "../config";
console.log("MODELS INDEX");

const Sequelize = require("sequelize");
const {
  accountSeed,
  userSeed,
  postSeed,
  agentSeed,
  statusSeed,
  commentSeed,
} = require("./seedData");

// Create the sequelize client by connecting to db with config options

// console.log("CONFIG.DATABSE", config.database);
const { connectionUrl, options } = config.database;
const isDevelopment = config.NODE_ENV === "development";
const isProduction = config.NODE_ENV === "production";

const sequelize = new Sequelize(connectionUrl, options);

async function connectToPostgres() {
  await sequelize
    .authenticate()
    .then(() => {
      console.log("Successfully connected to the database.");
    })
    .catch((error) => {
      console.log("Unable to connect to the databse.:", error);
      process.exit(1);
    });
  return sequelize;
}

const models = {
  sequelize: sequelize,
  // Add models below:
  Account: require("./Account")(sequelize),

  User: require("./User")(sequelize),
  Agent: require("./Agent")(sequelize),
  Status: require("./Status")(sequelize),
  Post: require("./Post")(sequelize),
  Comment: require("./Comment")(sequelize),
  // more models...
};

// Call associate methods
Object.keys(models).forEach((modelName) => {
  console.log("Associating...", modelName);
  if (models[modelName].associate) {
    try {
      models[modelName].associate(models);
      console.log(`Associated ${modelName} successfully.`);
    } catch (error) {
      console.log(`ERROR ASSOCIATING, ${modelName}`);
    }
  }
});

// Sync
async function syncModels() {
  console.log("SYNCING MODELS");
  try {
    // Use one of these sync options
    await sequelize.sync({ force: isDevelopment }); // Drops and recreates
    // await sequelize.sync({ alter: isDevelopment }); // Upserts / modifies without dropping
    console.log("SYNCED MODELS");
  } catch (error) {
    console.log("ERROR SYNCING: ", error);
  }
}

// Add seed data
async function seedData() {
  if (isProduction) {
    console.log("Skipping seed in Production.");
    return;
  } else {
    console.log("Begin SEEDING");
    try {
      // Seed Accounts
      for (const account of accountSeed) {
        await models.Account.upsert(account); // upsert: update if exists, otherwise insert
      }
      console.log("Upserted seed data for accounts.");

      // Seed Users
      for (const user of userSeed) {
        await models.User.upsert(user, { validate: true });
      }
      console.log("Upserted seed data for users.");

      // Seed Agents
      for (const agent of agentSeed) {
        await models.Agent.upsert(agent, { validate: false });
      }
      console.log("Upserted seed data for Agents.");

      // Seed Posts
      for (const post of postSeed) {
        await models.Post.upsert(post);
      }
      console.log("Upserted seed data for posts.");
      // Seed Comments
      for (const comment of commentSeed) {
        await models.Comment.upsert(comment);
      }
      console.log("Upserted seed data for comments.");
    } catch (error) {
      console.log("Error seeding:", error);
    }
  }
}
connectToPostgres()
  .then(() => syncModels())
  .then(
    async () => {
      console.log("AGENT AFTER SYNC, before SEED");
      await seedData();
    },
    (e) => console.log("Error syncing or seeding:", e)
  )
  .then(() =>
    // Upon server start, schedule all active agent tasks
    {
      const AgentService = require("../services/AgentService");
      AgentService.loadActive();
    }
  )
  .catch((e) => console.log("Error syncing or seeding:", e));

module.exports = models;
