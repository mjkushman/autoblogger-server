// const { DataTypes } = require("sequelize");
// const Org = require("./Org_new");
// const User = require("./User_new");
// const Post = require("./Post_new");
// const EndUser = require("./User_new");
const Sequelize = require("sequelize");
const config = require("../config")["development"];
const { orgSeed, blogSeed, userSeed, postSeed } = require("./seedData");

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
  Org: require('./Org_new')(sequelize),
  Blog: require('./Blog')(sequelize),
  User: require('./User_new')(sequelize),
  // EndUser: require('./User_new')(sequelize),
  Post: require('./Post_new')(sequelize),
  Comment: require('./Comment_new')(sequelize)
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
console.log('User Model',models.User.associate)


// Call associate methods
Object.keys(models).forEach((modelName) => {
  console.log('MODEL NAME',modelName)
  if (models[modelName].associate) {
    try {
      models[modelName].associate(models);
      console.log(`ASSOCIATED ${modelName}`)
    } catch (error) {
      console.log(`Error associating ${models}, ${modelName}`)
    }
  }
});

// What are these two lines even for?
// models.sequelize = sequelize;
// models.Sequelize = Sequelize;


// Add seed data
async function seedData() {
  await sequelize.sync({ force: true });
  try {
    let existingOrgs = await models.Org.findAll()

    if (existingOrgs.length === 0) {
      await models.Org.bulkCreate(orgSeed);
      console.log("Loaded seed data for orgs.");
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
    // let existingEndUsers = await models.EndUser.findAll()
    // if (existingEndUsers.length === 0) {
    //   await models.EndUser.bulkCreate(endUserSeed);
    //   console.log("Loaded seed data for endusers.");
    // }

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
