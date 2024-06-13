const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require("../config");

module.exports = (sequelize) => {
  
  const User = sequelize.define(
    "User",
    {
      userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      orgId: {
        type: DataTypes.STRING(8),
        references: {
          // This is a reference to another model
          model: "orgs",
          // This is the column name of the referenced model
          key: "orgId",
        },
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "super_admin"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      tableName: "users"
    },
    {
      hooks: {
        beforeCreate: async (record) => {
          if(record.password) {record.password = await bcrypt.hash(record.password, BCRYPT_WORK_FACTOR)}
        }
      },
      beforeUpdate: async (record) => {
        if(record.changed('password')) {record.password = await bcrypt.hash(record.password, BCRYPT_WORK_FACTOR)}
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["email", "orgId"], // email can only be in one org at a time
        },
      ],
    }
  );

    // Associations
    User.associate = (models) => {
      User.hasMany(models.Post, {foreignKey: 'userId', as: 'posts'})
    }

  return User;
};
