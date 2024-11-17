const { Account } = require("../models");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../utilities/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config")[process.env.NODE_ENV];

// Replaces jwtoken.js
class AuthService {
  
    static async generateToken(account) {
        // strip unecessary items from the token

        const cleanedAccount = {
          email: account.email,
          firstName: account.firstName,
          lastName: account.lastName,
          accountId: account.accountId,
          agents: account.agents,
          blogs: await account.blogs?.map(({ blogId, label }) => ({
            blogId,
            label,
          })),
        };
        console.log(`Returning cleaned account info: ${JSON.stringify(cleanedAccount)}`)
        return jwt.sign(cleanedAccount, SECRET_KEY, {expiresIn: '1d'})
    }
    
    
    // Accepts email, password. Returns signed JWT.
    static async authenticate({ email, password }) {
        console.log("Inside authenticate function");
        
        const account = await Account.findOne({ where: { email } });
        if (!account) return new NotFoundError("Account not found");
        
        const isValidPassword = bcrypt.compare(password, account.password);
        if (!isValidPassword) return new UnauthorizedError("Invalid password");
        

    return this.generateToken(account)
    
  }
}

module.exports = AuthService;
