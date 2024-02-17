const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** 
 * Accepts a user object, based on user model
 * return signed JWT from user data. */

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    firstName:user.firstName,
    lastName:user.lastName,
    authorBio: user.authorBio,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
