const { DataTypes } = require("sequelize");
const Org = require("./Org_new");


// passing in an instance of sequelize, inheritied from Services which import these models
module.exports = createModels = (sequelize) => {
  const orgs = Org(sequelize);

  //Other models go below:

  sequelize.sync({ alter: true });
  return orgs;
};
