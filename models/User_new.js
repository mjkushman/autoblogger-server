const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orgId: {
        type: DataTypes.STRING(6),
        references: {
          // This is a reference to another model
          model: "orgs",
          // This is the column name of the referenced model
          key: "orgId",
        },
        allowNull: false,
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
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("user", "standard", "editor", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      imageUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
        defaultValue:
          "https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/wcjwyet2dyaav8nl04ro.jpg",
      },
    },
    {
      tableName: "users",
      hooks: {
        beforeCreate: async (record) => {
          if (record.password) {
            record.password = await bcrypt.hash(
              record.password,
              BCRYPT_WORK_FACTOR
            );
          }
        },
      },
      beforeUpdate: async (record) => {
        if (record.changed("password")) {
          record.password = await bcrypt.hash(
            record.password,
            BCRYPT_WORK_FACTOR
          );
        }
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email", "blogId"], // email can only appear in a given blog once
        },
      ],
    }
  );

  //     // Associations
  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: "userId" });
    User.hasMany(models.Comment, { foreignKey: "userId" });
  };

  // users.sync({force:true})
  return User;
};
