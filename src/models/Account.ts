import { DataTypes, Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import config from "../config";
import IdGenerator from "../utilities/IdGenerator";
import { AppModel, Models } from "../types/Model.type";

export default (sequelize: Sequelize) => {
  const Account: AppModel = sequelize.define(
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
        beforeCreate: async (record: any) => {
          // create Id upon new record
          record.accountId = IdGenerator.accountId();
          // hash and save password
          record.password = await bcrypt.hash(record.password, config.BCRYPT_WORK_FACTOR);
        },
        beforeUpdate: async (record: any) => {
          if (record.changed("password")) {
            record.password = await bcrypt.hash(record.password, config.BCRYPT_WORK_FACTOR);
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
  Account.associate = (models: Models) => {
    Account.hasMany(models.Agent, {
      foreignKey: "accountId",
      // onDelete: "CASCADE",
    });
  };

  return Account;
};
