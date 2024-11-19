import config from "../config"


const Sequelize = require("sequelize");
const {
  accountSeed,
  blogSeed,
  userSeed,
  postSeed,
  agentSeed,
  statusSeed,
  commentSeed,
} = require("./seedData");

// Create the sequelize client by connecting to db with config options
const sequelize = new Sequelize(config.database.options);

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

connectToPostgres();

const models = {
  // Add models below:
  Account: require("./Account")(sequelize),
  Blog: require("./Blog")(sequelize),
  User: require("./User")(sequelize),
  Agent: require("./Agent"),
  Status: require("./Status")(sequelize),
  Post: require("./Post")(sequelize),
  Comment: require("./Comment")(sequelize),
  // more models...
};
// console.log("MODELS", models);

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

// What are these two lines even for?
models.sequelize = sequelize;
models.Sequelize = Sequelize;

// Add seed data
async function seedData() {
  await sequelize.sync({ force: true });
  try {
    // Seed Accounts
    for (const account of accountSeed) {
      await models.Account.upsert(account); // upsert: update if exists, otherwise insert
    }
    console.log("Upserted seed data for accounts.");

    // let existingAccounts = await models.Account.findAll();
    // if (existingAccounts.length === 0) {
    //   await models.Account.bulkCreate(accountSeed);
    //   console.log("Loaded seed data for accounts.");
    // }
    // Seed Blogs
    for (const blog of blogSeed) {
      await models.Blog.upsert(blog);
    }
    console.log("Upserted seed data for blogs.");

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
seedData();

module.exports = models;
