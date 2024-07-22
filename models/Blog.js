const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");
const IdGenerator = require("../utilities/IdGenerator");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const Blog = sequelize.define(
    "Blog",
    {
      blogId: {
        type: DataTypes.STRING(14),
        defaultValue: IdGenerator.blogId(),
        primaryKey: true,
        unique: true,
      },
      accountId: {
        type: DataTypes.STRING(40),
        references: {
          model: "accounts",
          key: "accountId",
        },
      },
      label: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "blogs",
      // hooks: {
      //   beforeCreate: (record) => {
      //     record.blogId = nanoid(9);
      //   },
      // },
    }
  );
  // Associations
  Blog.associate = (models) => {
    Blog.belongsTo(models.Account, { foreignKey: "accountId" });
    Blog.hasMany(models.Post, { foreignKey: "blogId" });
    Blog.hasMany(models.User, { foreignKey: "blogId" });
  };
  return Blog;
};
