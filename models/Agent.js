const { DataTypes, ValidationError, Sequelize, Model } = require("sequelize");
const { nanoid } = require("nanoid");
const IdGenerator = require("../utilities/IdGenerator");
const cronstrue = require("cronstrue");
const cron = require("node-cron");
const config = require("../config")["development"];
const {cronEncode, cronDecode} = require('../utilities/cronEncoder' )

const sequelize = new Sequelize(config.database.options);

const validLLMs = ["chatgpt", "claude"];





class Agent extends Model {}

Agent.init(
  {
    // model attributes
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
    isEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    postSettings: {
      type: DataTypes.JSONB,
      defaultValue: {
        isEnabled: false,
        llm: "chatgpt",
        maxWords: 10000,
        cronSchedule: null,
        displaySchedule: null,
        time: "12:00",
        daysOfWeek: [],
        timezone: "America/Los_Angeles",
        personality: null,
      },
      validate: {
        hasValidPersonality(value) {
          if (value.personality && typeof value.personality !== 'string')
            throw new ValidationError(
              `personality must be a valid string`
            );
        },
        hasScheduleIfEnabled(value) {
          if (value.isEnabled && (!value.time || !value.timezone || !value.daysOfWeek))
            throw new ValidationError(
              `Time, days of week, and timezone must be supplied if enabling posting for an agent.`
            );
        },
        isValidLLM(value) {
          if (value.llm && !validLLMs.includes(value.llm))
            throw new ValidationError(
              `llm must be one of: ${validLLMs.join(", ")}`
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
        llm: "chatgpt",
        maxWords: 200,
        personality: null
      },
      validate: {
        hasValidPersonality(value) {
          if (value.personality && typeof value.personality !== 'string')
            throw new ValidationError(
              `personality must be a valid string`
            );
        },
        isValidLLM(value) {
          if (value.llm && !validLLMs.includes(value.llm))
            throw new ValidationError(
              `llm must be one of: ${validLLMs.join(", ")}`
            );
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
            throw new ValidationError(
              `llm must be one of: ${validLLMs.join(", ")}`
            );
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
  // model options
  {
    sequelize,
    tableName: "agents",
    hooks: {
      beforeUpdate: async (record) => {
        // create a valid cron expression from time and days
        if(record.postSettings?.daysOfWeek && record.postSettings?.time) {
          try {
            
            let encodedCron =cronEncode({
              time: record.postSettings.time,
              daysOfWeek: record.postSettings.daysOfWeek,
            });
  
            record.postSettings.cronSchedule = encodedCron
          } catch (error) {
            throw new Error(error)
          }
        };
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
  Agent.belongsTo(models.Blog, { foreignKey: "blogId" });
  Agent.belongsTo(models.Account, { foreignKey: "accountId" });
  // Agent.hasMany(models.Post);
  Agent.hasMany(models.Post, { foreignKey: "agentId", onDelete: 'CASCADE' });
};

module.exports = Agent;
