// const { DataTypes } = require("sequelize");
// const { nanoid } = require("nanoid");

// module.exports = (sequelize) => {
//   // console.log(sequelize)
//   const Org = sequelize.define(
//     "Org",
//     {
//       orgId: {
//         type: DataTypes.STRING(6),
//         defaultValue: nanoid(6),
//         primaryKey: true,
//         unique: true,
//       },
//       name: {
//         type: DataTypes.STRING,
//       },
//       email: {
//         type: DataTypes.STRING,
//         validate: {
//           isEmail: true,
//         },
//         allowNull: false,
//       },
//       plan: {
//         type: DataTypes.ENUM("free", "standard", "enterprise"),
//         defaultValue: "free"
//       },
//       accessKey: {
//         type: DataTypes.STRING,
//       },
//     },
//     {
//       tableName: "orgs",
//     }
//   );
//   // Associations
//   Org.associate = (models) => {
//     Org.hasMany(models.Blog, { foreignKey: "orgId"});
//     Org.hasMany(models.User, { foreignKey: "orgId"});
//   };
//   return Org;
// };
