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
        primaryKey: true,
        unique: true,
      },
      accountId: {
        type: DataTypes.STRING(14),
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
      hooks: {
        beforeCreate: async (record) => {
          record.blogId = IdGenerator.blogId();
        },
      },
    }
  );
  // Associations
  Blog.associate = (models) => {
    Blog.belongsTo(models.Account, { foreignKey: "accountId" });
    Blog.hasMany(models.Post, { foreignKey: "blogId", onDelete: 'CASCADE' });
    Blog.hasMany(models.Comment, { foreignKey: "blogId", onDelete: 'CASCADE' });
    Blog.hasMany(models.User, { foreignKey: "blogId", onDelete: 'CASCADE' });
  };
  return Blog;
};
