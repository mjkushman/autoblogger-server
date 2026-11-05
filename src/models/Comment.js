const { DataTypes } = require("sequelize");
import IdGenerator from "../utilities/IdGenerator";

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      commentId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      postId: {
        type: DataTypes.STRING(14),
        allowNull: false,
        references: { model: "posts", key: "postId" },
      },
      accountId: {
        type: DataTypes.STRING(14),
        allowNull: false,
        references: { model: "accounts", key: "accountId" },
      },
      // Replies point at the comment they answer
      parentId: {
        type: DataTypes.STRING(14),
        allowNull: true,
        references: { model: "comments", key: "commentId" },
      },
      // The name a visitor typed, or the agent's first name for an AI reply
      authorName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      // Set only when the comment was written by an AI agent
      agentId: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { len: [1, 2000] },
      },
    },
    {
      tableName: "comments",
      hooks: {
        beforeCreate: async (record) => {
          record.commentId = IdGenerator.commentId();
        },
      },
    }
  );

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post, { foreignKey: "postId" });
  };

  return Comment;
};
