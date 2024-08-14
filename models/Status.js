const { NODE_ENV } = require("../config");
const config = require("../config")[NODE_ENV];
const sequelize = new Sequelize(config.database.options);
const { Model, Sequelize, DataTypes } = require("sequelize");
const IdGenerator = require("../utilities/IdGenerator");

class Status extends Model {}

Status.init(
  // Model attributes
  {
    statusId: {
      type: DataTypes.STRING(40),
      primaryKey: true,
    },
    status: {
      type: DataTypes.ENUM("not_started", "in_progress", "success", "error"),
      defaultValue: "not_started",
    },
    type: {
      type: DataTypes.ENUM("post", "comment", "success", "error"),
    },
    result: {
      type: DataTypes.JSONB,
      defaultValue: null,
    },
  },
  // Model options
  {
    sequelize,
    tableName: "status",
    hooks: {
      beforeCreate: async (record) => {
        record.statusId = IdGenerator.statusId(); // set the status Id
      },
    },
  }
);

module.exports = Status;