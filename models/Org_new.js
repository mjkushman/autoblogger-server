const { DataTypes } = require("sequelize");
const { nanoid } = require("nanoid");

module.exports = (sequelize) => {
  // console.log(sequelize)
  const Org = sequelize.define(
    "Org",
    {
      orgId: {
        type: DataTypes.STRING(8),
        defaultValue: nanoid(8),
        primaryKey: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      plan: {
        type: DataTypes.ENUM("free", "standard", "enterprise"),
      },
      accessKey: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "orgs",
    }
  );
  // Associations
  Org.associate = (models) => {
    Org.hasMany(models.User, { foreignKey: "orgId", as: "users" });
  };
  Org.associate = (models) => {
    Org.hasMany(models.EndUser, { foreignKey: "orgId", as: "endUsers" });
  };
  // orgs.sync({force:true})
  return Org;
};
