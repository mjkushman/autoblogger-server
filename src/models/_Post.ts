
const { DataTypes } = require("sequelize");
import slug from "slug";
import IdGenerator from "../utilities/IdGenerator";
const {Account} = require("../models");


module.exports = (sequelize) => {

  const Post = sequelize.define(
    "Post",
    {
      postId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      authorId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountId: {
        type: DataTypes.STRING(14),
        references: {
          // This is a reference to another model
          model: "accounts",
          // This is the column name of the referenced model
          key: "accountId",
        },
        allowNull: false,
      },
      blogId: {
        type: DataTypes.STRING(14),
        references: {
          // This is a reference to another model
          model: "blogs",
          // This is the column name of the referenced model
          key: "blogId",
        },
        allowNull: false,
      },
      titlePlaintext: { type: DataTypes.STRING },
      titleHtml: { type: DataTypes.TEXT },
      bodyPlaintext: { type: DataTypes.TEXT },
      bodyHtml: { type: DataTypes.TEXT },
      imageUrl: {
        type: DataTypes.TEXT,
        validate: {
          isUrl: true,
        },
      },
      slug: { type: DataTypes.STRING },
      isPublished: { type: DataTypes.BOOLEAN },
    },
    {
      tableName: "posts",
      hooks: {
        beforeCreate: async (record) => {
          record.postId = IdGenerator.postId();
          if (record.titlePlaintext) {
            record.slug = slug(record.titlePlaintext);
          }
        },
      },
      beforeUpdate: async (record) => {
        if (record.titlePlaintext) {
          record.slug = slug(record.titlePlaintext);
        }
      },
    },
    {
      validate: {
        mustHaveUserOrAgentId() {
          if (!this.agentId && !this.userId) throw new Error(
            "At least one of userId or agentId must be provided."
          );
        },
      },
    }
  );

  // Associations
  Post.associate = (models) => {
    Post.belongsTo(models.Account, { foreignKey: "accountId" });
    Post.belongsTo(models.Agent, { foreignKey: "agentId" });
    Post.belongsTo(models.Blog, { foreignKey: "blogId" });
    Post.hasMany(models.Comment, { foreignKey: "postId", onDelete: "CASCADE" });
  };

  return Post;
};
