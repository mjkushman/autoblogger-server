"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware for requiring authorizations
 *
 *
 */





// Make sure a JWT is signed and all that
/** Middleware to store the contents of the JWT on res.locals.user
 * If there are headers and a token provided in the authorization header,
 * Attempt to decode the token and store it on res.locals.user.
 * If decoding fails - probably due to invalid signature - throw an error but still return next.
 * 
 * If no token, also return next
 * Token is not needed. But it will only store res.locals.user if a valid token is provided.
 */
function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (error) {
    return next();
  }
}




/** Makes sure a user is logged in by checking for a user object on res.locals
 * The function above, verifyJWT, will set res.locals.user if a valid token is provided
 */
function verifyLoggedIn(req, res, next) {
    try {

      if(res.locals.user == null) throw new UnauthorizedError();
      return next();
    } catch (error) {
      return next(error);
    }
  }




// Make sure the user is logged in and is an admin
function verifyAdmin() {console.log('verifyAdmin')}



// Make sure the user is logged in and their request pertains to themselves
function verifyCorrectUser() {console.log('verifyCorrectUser')}


module.exports = {verifyLoggedIn, verifyJWT, verifyAdmin, verifyCorrectUser };
