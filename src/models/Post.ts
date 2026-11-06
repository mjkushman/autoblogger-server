import { DataTypes, Sequelize } from "sequelize";
import slug from "slug";
import IdGenerator from "../utilities/IdGenerator";
import { AppModel, Models } from "../types/Model.type";

export default (sequelize: Sequelize) => {
  const Post: AppModel = sequelize.define(
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
      title: { type: DataTypes.STRING },
      content: { type: DataTypes.TEXT },
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
        beforeCreate: async (record: any) => {
          record.postId = IdGenerator.postId();
          if (record.title) {
            record.slug = slug(record.title);
          }
        },
        beforeUpdate: async (record: any) => {
          if (record.title) {
            record.slug = slug(record.title);
          }
        },
      },
    }
  );

  // Associations
  Post.associate = (models: Models) => {
    Post.belongsTo(models.Account, { foreignKey: "accountId"});
    Post.belongsTo(models.Agent, { foreignKey: "agentId"});
    // Post.belongsTo(models.Blog, { foreignKey: "blogId" });
    Post.hasMany(models.Comment, { foreignKey: "postId", as: "comments", onDelete: "CASCADE" });
  };

  return Post;
};
