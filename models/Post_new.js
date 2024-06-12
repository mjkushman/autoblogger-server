const { DataTypes } = require("sequelize");
const {nanoid} = require('nanoid')
const slug = require('slug');

module.exports = (sequelize) => {

  const posts = sequelize.define("posts",
    {
      postId: {
        type: DataTypes.STRING(6),
        defaultValue: nanoid(6),
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
      orgId: {
        type: DataTypes.STRING(8),
        references: {
          // This is a reference to another model
          model: "orgs",
          // This is the column name of the referenced model
          key: "orgId",
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
        // defaultValue: slug(this.titlePlaintext),
        set(value) {
          this.setDataValue('slug', slug(this.titlePlaintext))
        }
      },
    },
    {
      validate: {
        mustHaveUserOrAgentId() {
          if(!this.agentId && !this.userId) throw new Error ("At least one of userId or agentId must be provided.")
        }
      }
    }
  );
  return posts;
};
