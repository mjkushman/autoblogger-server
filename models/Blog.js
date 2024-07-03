const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const Blog = sequelize.define(
    "Blog",
    {
      blogId: {
        type: DataTypes.STRING(9),
        primaryKey: true,
        unique: true,
      },
      orgId: {
        type: DataTypes.STRING(6),
        references: {
          model: "orgs",
          key: "orgId",
        }
      },
      title: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "blogs",
      hooks: {
        beforeCreate: (record) => {
          record.blogId = nanoid(9);
        }
      }
    },
  );
  // Associations
  Blog.associate = (models) => {
    Blog.hasMany(models.Post, {foreignKey: 'blogId'});
    Blog.hasMany(models.User, {foreignKey: 'blogId'});
  };
  return Blog;
};
