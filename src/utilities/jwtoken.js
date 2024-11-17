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
    userId: user.userId,
    firstName:user.firstName,
    lastName:user.lastName,
    authorBio: user.authorBio,
    imageUrl: user.imageUrl,
    isAdmin: user.isAdmin || false,
  };
  const signedToken = jwt.sign(payload, SECRET_KEY, {expiresIn: "3 days"})
  return signedToken;
}

module.exports = { createToken };
