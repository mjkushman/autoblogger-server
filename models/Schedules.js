const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");
const IdGenerator = require("../utilities/IdGenerator");
const cronstrue = require("cronstrue");

module.exports = (sequelize) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      scheduleId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      agentId: {
        type: DataTypes.STRING(40),
        references: {
            model: "agents",
            key: "agentId"
        }
      },
      channel: {
        type: DataTypes.ENUM('posts','comments','social'),
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
    },
    {
      tableName: "schedules",
    //   hooks: {
    //     beforeCreate: async (record) => {
    //       record.agentId = IdGenerator.agentId();
    //       if (record.cronSchedule) {
    //         console.log('before Create Hook cronSchedule:', record.cronSchedule)
    //         record.displaySchedule = cronstrue.toString(record.cronSchedule);
    //         console.log('before Create Hook displaySchedule:', record.displaySchedule)
            
    //       }
    //     },
    //     beforeUpdate: async (record) => {
    //       if (record.cronSchedule) {
    //         console.log('before Update Hook cronSchedule:', record.cronSchedule)
    //         record.displaySchedule = cronstrue.toString(record.cronSchedule);
    //       }
    //     },
    //   },
    }
  );
  // Associations
//   Schedule.associate = (models) => {
//     Schedule.belongsTo(models.Blog, { foreignKey: "blogId" });
//     Schedule.belongsTo(models.Account, { foreignKey: "accountId" });
//   };
  return Schedule;
};
