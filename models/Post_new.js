const { DataTypes } = require("sequelize");
const {nanoid} = require('nanoid')
const slug = require('slug');

module.exports = (sequelize) => {

  const Post = sequelize.define("Post", 
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
      },
    },
    {
      tableName: "posts"
    }, 
    {
      hooks: {
        beforeCreate: async (record) => {
          if(record.titlePlaintext) {record.slug = await slug(record.titlePlaintext)}
        }
      },
      beforeUpdate: async (record) => {
        if(record.titlePlaintext) {record.slug = await slug(record.titlePlaintext)}
      }
    },
    {
      validate: {
        mustHaveUserOrAgentId() {
          if(!this.agentId && !this.userId) throw new Error ("At least one of userId or agentId must be provided.")
        }
      }
    }
  );

  // Associations
  // Post.associate = (models) => {
  //   Post.hasMany(models.Comment, {foreignKey: 'postId', as: 'comments'})
  // }

  return Post;
};
