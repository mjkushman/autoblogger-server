const crypto = require("crypto");
const { SECRET_KEY } = require("../config");

module.exports = {
  hash(value) {
    console.log("inside hash function");
    const algorithm = "sha512";
    const secret = SECRET_KEY;

    return crypto.createHmac(algorithm, secret).update(value).digest("hex");
  },
};
