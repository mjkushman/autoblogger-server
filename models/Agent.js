const { DataTypes, ValidationError } = require("sequelize");
const { nanoid } = require("nanoid");
const IdGenerator = require("../utilities/IdGenerator");
const cronstrue = require("cronstrue");
const cron = require("node-cron");

module.exports = (sequelize) => {
  const validLLMs = ["chatgpt", "claude"];
  const Agent = sequelize.define(
    "Agent",
    {
      agentId: {
        type: DataTypes.STRING(40),
        primaryKey: true,
      },
      accountId: {
        type: DataTypes.STRING(40),
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
      postSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          llm: "chatgpt",
          maxWords: 10000,
          cronSchedule: null,
          displaySchedule: null,
        },
        validate: {
          hasValidCron(value) {
            if (value.cronSchedule && !cron.validate(value.cronSchedule))
              throw new ValidationError(`cronSchedule must be a valid cron expression`);
          },
          hasCronIfEnabled(value) {
            if (value.isEnabled && !value.cronSchedule)
              throw new ValidationError(
                `cronSchedule must be supplied if isEnabled: true`
              );
          },
          isValidLLM(value) {
            if (value.llm && !validLLMs.includes(value.llm))
              throw new ValidationError(`llm must be one of: ${validLLMs.join(", ")}`);
          },
          maxWordCount(value) {
            if (value && value.maxWords) {
              const wordLimit = 10000;
              if (value.maxWords > wordLimit) {
                throw new ValidationError(`maxWords must be ${wordLimit} or less`);
              }
            }
          },
        },
      },
      commentSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          llm: "chatgpt",
          maxWords: 100,
        },
        validate: {
          isValidLLM(value) {
            if (value.llm && !validLLMs.includes(value.llm))
              throw new ValidationError(`llm must be one of: ${validLLMs.join(", ")}`);
          },
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
      socialSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          llm: "chatgpt",
          maxWords: 100,
        },
        validate: {
          isValidLLM(value) {
            if (value.llm && !validLLMs.includes(value.llm))
              throw new ValidationError(`llm must be one of: ${validLLMs.join(", ")}`);
          },
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
    {
      tableName: "agents",
      hooks: {
        beforeUpdate: async (record) => {
          if (record.postSettings.cronSchedule) {
            console.log(
              "HOOK! before Update Hook cronSchedule:",
              record.postSettings.cronSchedule
            );
            record.postSettings.displaySchedule = cronstrue.toString(
              record.postSettings.cronSchedule
            );
          }
        },
        beforeCreate: async (record) => {
          record.agentId = IdGenerator.agentId(); // set the agentId
          if (record.postSettings.cronSchedule) {
            // set the agent cron display schedule
            // record.postSettings.cronSchedule = record.postSettings.cronSchedule || "0 0 */365 * *"
            console.log(
              "before Create Hook cronSchedule:",
              record.postSettings.cronSchedule
            );
            record.postSettings.displaySchedule = cronstrue.toString(
              record.postSettings.cronSchedule
            );
            console.log(
              "before Create Hook displaySchedule:",
              record.postSettings.displaySchedule
            );
          }
        },
      },
    }
  );
  // Associations
  Agent.associate = (models) => {
    Agent.belongsTo(models.Blog, { foreignKey: "blogId" });
    Agent.belongsTo(models.Account, { foreignKey: "accountId" });
  };
  return Agent;
};
