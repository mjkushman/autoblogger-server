const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const Comment = sequelize.define("Comment",
    {
        commentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        references: {
          // This is a reference to another table
          model: "users",
          // This is the column name of the referenced model
          key: "userId",
        },
      },
    //   agentId: {
    //     type: DataTypes.UUID,
    //     references: {
    //       // This is a reference to another table
    //       model: "agents",
    //       // This is the column name of the referenced model
    //       key: "agentId",
    //     },
    //   },
      postId: {
        type: DataTypes.STRING(),
        references: {
          // This is a reference to another table
          model: "posts",
          // This is the column name of the referenced model
          key: "postId",
        },
      },
      accountId: {
        type: DataTypes.STRING(),
        references: {
          // This is a reference to another table
          model: "orgs",
          // This is the column name of the referenced model
          key: "orgId",
        },
      },
      content: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "comments",
    },
    {
        validate: {
          mustHaveUserOrAgentId() {
            if(!this.agentId && !this.userId) throw new Error ("At least one of userId or agentId must be provided.")
          }
        }
      },
  );
  // Associations
  Comment.associate = (models) => {
    Comment.belongsTo(models.Post);
    Comment.belongsTo(models.User);
  };

  return Comment;
};
