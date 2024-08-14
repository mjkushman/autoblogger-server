const { Model, Sequelize, DataTypes } = require("sequelize");
const IdGenerator = require("../utilities/IdGenerator");


// const sequelize = new Sequelize(config.database.options);

module.exports = (sequelize) => {
  const Status = sequelize.define(
    "Status",
    // Model attributes
    {
      statusId: {
        type: DataTypes.STRING(40),
        primaryKey: true,
      },
      status: {
        type: DataTypes.ENUM("new_request", "in_progress", "success", "error"),
        defaultValue: "new_request",
      },
      type: {
        type: DataTypes.ENUM("post", "comment"),
      },
      result: {
        type: DataTypes.JSONB,
        defaultValue: null,
      },
    },
    // Model options,
    {
      tableName: "status",
      hooks: {
        beforeCreate: async (record) => {
          record.statusId = IdGenerator.statusId(); // set the status Id
        },
      },
    }
  );
  return Status
};
