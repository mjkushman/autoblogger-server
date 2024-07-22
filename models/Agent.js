const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");
const IdGenerator = require("../utilities/IdGenerator");
const cronstrue = require("cronstrue");

module.exports = (sequelize) => {
  const Agent = sequelize.define(
    "Agent",
    {
      agentId: {
        type: DataTypes.STRING(40),
        defaultValue: IdGenerator.agentId(),
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
      imageUrl: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
        defaultValue:
          "https://res.cloudinary.com/dsvtolrpi/image/upload/v1708534477/wcjwyet2dyaav8nl04ro.jpg",
      },
      isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cronSchedule: {
        type: DataTypes.STRING,
      },
      displaySchedule: {
        type: DataTypes.STRING,
      },
      authorBio: { type: DataTypes.TEXT },
    },
    {
      tableName: "agents",
      hooks: {
        beforeCreate: async (record) => {
          if (record.cronSchedule) {
            console.log('before Create Hook cronSchedule:', record.cronSchedule)
            record.displaySchedule = cronstrue.toString(record.cronSchedule);
            console.log('before Create Hook displaySchedule:', record.displaySchedule)
            
          }
        },
        beforeUpdate: async (record) => {
          if (record.cronSchedule) {
            console.log('before Update Hook cronSchedule:', record.cronSchedule)
            record.displaySchedule = cronstrue.toString(record.cronSchedule);
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
