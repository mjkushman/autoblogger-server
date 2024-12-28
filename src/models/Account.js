const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const config = require("../config");
import IdGenerator from "../utilities/IdGenerator";

module.exports = (sequelize) => {
  const Account = sequelize.define(
    "Account",
    {
      accountId: {
        // value is created by a hook below
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apiKeyIndex: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      openAiApiKey: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "accounts",
      hooks: {
        beforeCreate: async (record) => {
          // create Id upon new record
          console.log("CREATING ACCOUNT: ",record)
          record.accountId = IdGenerator.accountId();

          // hash password key before saving
          if (record.password) {
            bcrypt.hash(
              record.password,
              config.BCRYPT_WORK_FACTOR,
              (err, hashedPassword) => {
                record.password = hashedPassword;
              }
            );
          }
          // hash api key before saving
          if (record.apiKey) {
            bcrypt.hash(
              record.apiKey,
              config.BCRYPT_WORK_FACTOR,
              (err, hashedApiKey) => {
                record.apiKey = hashedApiKey;
              }
            );
          }
        },
        beforeUpdate: async (record) => {
          if (record.changed("password")) {
            bcrypt.hash(
              record.password,
              config.BCRYPT_WORK_FACTOR,
              (err, hashedPassword) => {
                record.password = hashedPassword
              }
            );
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"], // email must be unique
        },
      ],
    }
  );

  // Associations
  Account.associate = (models) => {
    Account.hasMany(models.Agent, {
      foreignKey: "accountId",
      // onDelete: "CASCADE",
    });
  };

  return Account;
};
