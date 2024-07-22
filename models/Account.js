const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const IdGenerator = require("../utilities/IdGenerator");

module.exports = (sequelize) => {
  const Account = sequelize.define(
    "Account",
    {
      accountId: {
        type: DataTypes.STRING(40),
        defaultValue: IdGenerator.accountId(),
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
          // hash password key before saving
          if (record.password) {
            record.password = await bcrypt.hash(
              record.password,
              BCRYPT_WORK_FACTOR
            );
          }
          // hash api key before saving
          if (record.apiKey) {
            record.apiKey = await bcrypt.hash(
              record.apiKey,
              BCRYPT_WORK_FACTOR
            );
          }
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
    Account.hasMany(models.Blog, { foreignKey: "accountId" });
    Account.hasMany(models.Agent, { foreignKey: "accountId" });
  };

  return Account;
};
