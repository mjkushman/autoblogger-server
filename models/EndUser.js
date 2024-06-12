const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const endUsers = sequelize.define(
    "end_users",
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orgId: {
        type: DataTypes.UUID,
        references: {
          // This is a reference to another model
          model: "orgs",
          // This is the column name of the referenced model
          key: "orgId",
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
      passwordHash: {
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
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      imageUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
        defaultValue: "https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/wcjwyet2dyaav8nl04ro.jpg",
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email", "orgId"], // email can only be in one org at a time
        },
      ],
    }
  );
  // users.sync({force:true})
  return endUsers;
};

/**
PK user_id UUID
FK org_id UUID
username varchar
password_hash text
first_name varchar
last_name varchar
email varchar
role enum
created_at timestamp
image_url text
role enum
author_bio text
 */
