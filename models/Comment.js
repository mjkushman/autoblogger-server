const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const Comment = sequelize.define(
    "Comment",
    {
      commentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      authorId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      postId: {
        type: DataTypes.STRING(14),
        references: {
          // This is a reference to another table
          model: "posts",
          // This is the column name of the referenced model
          key: "postId",
        },
      },
      accountId: {
        type: DataTypes.STRING(40),
        allowNull: false,
        references: {
          // This is a reference to another table
          model: "accounts",
          // This is the column name of the referenced model
          key: "accountId",
        },
      },
      content: {
        type: DataTypes.TEXT,
      },
      parentId: {
        type: DataTypes.INTEGER,
        references: {
          model: "comments",
          key: "commentId"
        }
      }
    },
    {
      tableName: "comments",
    },
  );
  // Associations
  Comment.associate = (models) => {
    Comment.belongsTo(models.Post, { foreignKey: "postId" });
    // Comment.belongsTo(models.User, { foreignKey: "userId" });
    // Comment.belongsTo(models.Agent, { foreignKey: "agentId" });
    // Comment.belongsTo(models.Blog, { foreignKey: "blogId" });
  };

  return Comment;
};
