const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    // console.log(sequelize)
    const Orgs = sequelize.define("orgs", {
      orgId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    });
    return Orgs

}