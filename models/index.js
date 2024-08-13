
const Sequelize = require("sequelize");
const config = require("../config")["development"];
const { accountSeed, blogSeed, userSeed, postSeed, agentSeed } = require("./seedData");

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
  // Org: require('./Org_new')(sequelize),
  Account: require('./Account')(sequelize),
  Blog: require('./Blog')(sequelize),
  User: require('./User_new')(sequelize),
  Agent: require('./Agent'),
  // Agent: require('./Agent')(sequelize),
  Post: require('./Post_new')(sequelize),
  Comment: require('./Comment_new')(sequelize),
  // more models...
}

// const models = {
//   // Add models below:
//   Org: Org(sequelize),
//   User: User(sequelize),
//   EndUser: EndUser(sequelize),
//   Post: Post(sequelize)
//   // more models...
// }

console.log('MODELS',models)

// Call associate methods
Object.keys(models).forEach((modelName) => {
  console.log('Associating...',modelName)
  if (models[modelName].associate) {
    try {
      models[modelName].associate(models);
      console.log(`Associated ${modelName} successfully.`)
    } catch (error) {
      console.log(`ERROR ASSOCIATING, ${modelName}`)
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
    
    let existingAccounts = await models.Account.findAll()
    if (existingAccounts.length === 0) {
      await models.Account.bulkCreate(accountSeed);
      console.log("Loaded seed data for accounts.");
    }
    let existingBlogs = await models.Blog.findAll()
    if (existingBlogs.length === 0) {
      await models.Blog.bulkCreate(blogSeed);
      console.log("Loaded seed data for blogs.");
    }
    let existingUsers = await models.User.findAll()
    if (existingUsers.length === 0) {
      await models.User.bulkCreate(userSeed,{validate:true});
      console.log("Loaded seed data for users.");
    }
    let existingAgents = await models.Agent.findAll()
    if (existingAgents.length === 0) {
      await models.Agent.bulkCreate(agentSeed, {validate:true});
      console.log("Loaded seed data for Agents.");
    }

    let existingPosts = await models.Post.findAll()
    if (existingPosts.length === 0) {
      await models.Post.bulkCreate(postSeed);
      console.log("Loaded seed data for posts.");
    }
  } catch (error) {
    console.log("Error seeding:", error);
  }
}
seedData();

module.exports = models;
