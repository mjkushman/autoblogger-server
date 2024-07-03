const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");
const slug = require("slug");

module.exports = (sequelize) => {
  const Post = sequelize.define(
    "Post",
    {
      postId: {
        type: DataTypes.STRING(10),
        defaultValue: nanoid(10),
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        references: {
          // This is a reference to another model
          model: "users",
          // This is the column name of the referenced model
          key: "userId",
        },
      },
      blogId: {
        type: DataTypes.STRING(9),
        references: {
          // This is a reference to another model
          model: "blogs",
          // This is the column name of the referenced model
          key: "blogId",
        },
        allowNull: false,
      },

      titlePlaintext: {
        type: DataTypes.STRING,
      },
      titleHtml: {
        type: DataTypes.TEXT,
      },
      bodyPlaintext: {
        type: DataTypes.TEXT,
      },
      bodyHtml: {
        type: DataTypes.TEXT,
      },
      imageUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "posts",
      hooks: {
        beforeCreate: async (record) => {
          if (record.titlePlaintext) {
            record.slug = await slug(record.titlePlaintext);
          }
        },
      },
      beforeUpdate: async (record) => {
        if (record.titlePlaintext) {
          record.slug = await slug(record.titlePlaintext);
        }
      },
    },
    {
      validate: {
        mustHaveUserOrAgentId() {
          if (!this.agentId && !this.userId)
            throw new Error(
              "At least one of userId or agentId must be provided."
            );
        },
      },
    }
  );

  // Associations
  Post.associate = (models) => {
    Post.belongsTo(models.User);
    Post.belongsTo(models.Blog);
    Post.hasMany(models.Comment, { foreignKey: "postId" });
  };

  return Post;
};
