console.log("AGENT MODEL");
const { DataTypes, ValidationError, Sequelize, Model } = require("sequelize");

import IdGenerator from "../utilities/IdGenerator";
const cronstrue = require("cronstrue");
const cron = require("node-cron");

const { cronEncode, cronDecode } = require("../utilities/cronEncoder");
import config from "../config";
console.log("AGENT MODEL CONFIG", config);
// const sequelize = new Sequelize(config.database.options);
// const sequelize = new Sequelize(config.database.options);

const validModels = ["chatgpt", "claude"];

class Agent extends Model {}
module.exports = (sequelize) => {
  Agent.init(
    {
      // model attributes
      agentId: {
        type: DataTypes.STRING(14),
        primaryKey: true,
      },
      accountId: {
        type: DataTypes.STRING(14),
        references: {
          model: "accounts",
          key: "accountId",
        },
      },
      username: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
      },
      llm: {
        type: DataTypes.JSONB,
        defaultValue: {
          model: "chatgpt",
          apiKey: null,
        },
        validate: {
          isValidModel(value) {
            if (value.model && !validModels.includes(value.model))
              throw new ValidationError(
                `Model must be one of: ${validModels.join(", ")}`
              );
          },
          isValidApiKey(value) {
            if (value.apiKey && typeof value.apiKey != "string")
              throw new ValidationError(`Invalid API Key for LLM`);
          },
        },
      },
      isEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      postSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          maxWords: 10000,
          cronSchedule: `* * * * *`,
          displaySchedule: null,
          time: "12:00",
          daysOfWeek: ["mon"],
          timezone: "America/Los_Angeles",
          personality: null,
        },
        validate: {
          hasValidPersonality(value) {
            if (value.personality && typeof value.personality !== "string")
              throw new ValidationError(`personality must be a valid string`);
          },
          hasValidCron(value) {
            console.log("Validating cron of:", value);

            let cronResult = cron.validate(value.cronSchedule);
            console.log("cron validation result:", cronResult);
            if (!cron.validate(value.cronSchedule))
              throw new ValidationError(`Invalid posting schedule.`);
          },
          hasScheduleIfEnabled(value) {
            if (
              value.isEnabled &&
              (!value.time || !value.timezone || !value.daysOfWeek)
            )
              throw new ValidationError(
                `Time, days of week, and timezone must be supplied if enabling posting for an agent.`
              );
          },
          maxWordCount(value) {
            if (value && value.maxWords) {
              const wordLimit = 10000;
              if (value.maxWords > wordLimit) {
                throw new ValidationError(
                  `maxWords must be ${wordLimit} or less`
                );
              }
            }
          },
        },
      },
      commentSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          maxWords: 200,
          personality: null,
        },
        validate: {
          hasValidPersonality(value) {
            if (value.personality && typeof value.personality !== "string")
              throw new ValidationError(`personality must be a valid string`);
          },
        },
      },
      socialSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          maxWords: 100,
        },
        validate: {
          maxWordCount(value) {
            if (value && value.maxWords) {
              const wordLimit = 500;
              if (value.maxWords > wordLimit) {
                throw new Error(`maxWords must be ${wordLimit} or less`);
              }
            }
          },
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
        defaultValue:
          "https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/wcjwyet2dyaav8nl04ro.jpg",
      },
      authorBio: { type: DataTypes.TEXT },
    },
    // model options
    {
      sequelize,
      tableName: "agents",
      hooks: {
        beforeUpdate: async (record) => {
          // create a valid cron expression from time and days

          console.log("about to encode cron");
          try {
            let cronTab = cronEncode({
              time: record.postSettings.time,
              daysOfWeek: record.postSettings.daysOfWeek,
            });

            record.postSettings.cronSchedule = cronTab;
          } catch (error) {
            throw new Error(error);
          }

          // set the human readable schedule string
          if (record.postSettings.cronSchedule) {
            record.postSettings.displaySchedule = cronstrue.toString(
              record.postSettings.cronSchedule
            );
          }
        },
        beforeCreate: async (record) => {
          record.agentId = IdGenerator.agentId(); // set the agentId

          if (record.postSettings.cronSchedule) {
            // set the human readable schedule string
            record.postSettings.displaySchedule = cronstrue.toString(
              record.postSettings.cronSchedule
            );
          }
        },
      },
    }
  );
  // Associations
  Agent.associate = (models) => {
    Agent.belongsTo(models.Account, { foreignKey: "accountId" });
    // Agent.hasMany(models.Post);
    Agent.hasMany(models.Post, { foreignKey: "agentId", onDelete: "CASCADE" });
  };

  return Agent;
};
// module.exports = Agent;
