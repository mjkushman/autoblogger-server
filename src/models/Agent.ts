import { DataTypes, Model, Sequelize, ValidationError } from "sequelize";
import cronstrue from "cronstrue";
import cron from "node-cron";
import IdGenerator from "../utilities/IdGenerator";
import { MODELS, DEFAULT_MODEL, isValidModel } from "../utilities/llmModels";
import { sanitizeAgentInput } from "../utilities/sanitizePrompt";
import { Models } from "../types/Model.type";

class Agent extends Model {
  declare agentId: string;
  declare accountId: string;
  declare username: string;
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare llm: { model: string; apiKey: string | null };
  declare isEnabled: boolean;
  declare postSettings: any;
  declare commentSettings: any;
  declare socialSettings: any;
  declare imageUrl: string;
  declare authorBio: string;

  static associate?: (models: Models) => void;
}

export default (sequelize: Sequelize) => {
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
          model: DEFAULT_MODEL,
          apiKey: null,
        },
        validate: {
          isValidModel(value) {
            if (value.model && !isValidModel(value.model)) throw new ValidationError(`Model must be one of: ${MODELS.map((m) => m.model).join(", ")}`, []);
          },
          isValidApiKey(value) {
            if (value.apiKey && typeof value.apiKey !== "string") throw new ValidationError("Invalid API Key for LLM", []);
          },
        },
      },
      isEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      postSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: false,
          maxWords: 10000,
          cronSchedule: "* * * * *",
          displaySchedule: null,
          time: "12:00",
          daysOfWeek: ["mon"],
          timezone: "America/Los_Angeles",
          personality: "",
          bannedTopics: [],
        },
        validate: {
          hasValidPersonality(value) {
            if (value.personality && typeof value.personality !== "string") throw new ValidationError("personality must be a valid string", []);
          },
          hasValidBannedTopics(value) {
            if (value.bannedTopics && !Array.isArray(value.bannedTopics)) throw new ValidationError("bannedTopics must be a list", []);
          },
          hasValidCronifEnabled(value) {
            console.log("Validating cron of:", value);
            console.log("cron validation result:", cron.validate(value.cronSchedule));
            if (value.isEnabled && !cron.validate(value.cronSchedule)) {
              throw new ValidationError("Cannot enable without valid cron schedule.", []);
            } 
          },
          maxWordCount(value) {
            if (value && value.maxWords) {
              const wordLimit = 10000;
              if (value.maxWords > wordLimit) {
                throw new ValidationError(`maxWords must be ${wordLimit} or less`, []);
              }
            }
          },
        },
      },
      commentSettings: {
        type: DataTypes.JSONB,
        defaultValue: {
          isEnabled: true,
          maxWords: 100,
          personality: null,
        },
        validate: {
          hasValidPersonality(value) {
            if (value.personality && typeof value.personality !== "string") throw new ValidationError("personality must be a valid string", []);
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
        // Everything below ends up in an AI prompt, so clean it before it is stored
        beforeValidate: async (record: any) => {
          const clean = sanitizeAgentInput({
            firstName: record.firstName,
            lastName: record.lastName,
            authorBio: record.authorBio,
            postSettings: record.postSettings,
            commentSettings: record.commentSettings,
          });
          if (record.firstName != null) record.firstName = clean.firstName;
          if (record.lastName != null) record.lastName = clean.lastName;
          if (record.authorBio != null) record.authorBio = clean.authorBio;
          if (record.postSettings) record.postSettings = clean.postSettings;
          if (record.commentSettings) record.commentSettings = clean.commentSettings;
        },
        beforeUpdate: async (record: any) => {
          // set the human readable schedule string
          if (record.postSettings.cronSchedule) {
            record.postSettings.displaySchedule = cronstrue.toString(
              record.postSettings.cronSchedule
            );
          }
        },
        beforeCreate: async (record: any) => {
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
  Agent.associate = (models: Models) => {
    Agent.belongsTo(models.Account, { foreignKey: "accountId" });
    // Agent.hasMany(models.Post);
    Agent.hasMany(models.Post, { foreignKey: "agentId", onDelete: "CASCADE" });
  };

  return Agent;
};
