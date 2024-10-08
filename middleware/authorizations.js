"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../utilities/expressError");

/** Middleware for requiring authorizations
 *
 *
 */





/** Middleware to store the contents of the JWT on res.locals.user
 * If no token, also return next
 * Token is not needed. But it will only store res.locals.user if a valid token is provided.
 */
function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      console.log('found header: ',authHeader)
      let token = authHeader.replace(/^[Bb]earer\s+["']?([^"']+)["']?$/, "$1").trim(); // strip "bearer" and any quotes from the token

      req.user = jwt.verify(token, SECRET_KEY);
      console.log('stored user token to req.user', req.user)
    }
    return next();
  } catch (error) {
    return next();
  }
}


/** Makes sure a user is logged in by checking for a user object on res.locals
 * The function above, verifyJWT, will set res.locals.user if a valid token is provided
 */
function requireAuth(req, res, next) {
    console.log('VERIFY LOGIN',{...res.locals})
    try {
      if(req.user == null) throw new UnauthorizedError();
      return next();
    } catch (error) {
      return next(error);
    }
  }

// I was going to delete these two middleware but I might need to actually implement them later

// Make sure the user is logged in and is an admin
// function verifyAdmin() {console.log('verifyAdmin')}


// Make sure the user is logged in and their request pertains to themselves
// function verifyCorrectUser() {console.log('verifyCorrectUser')}


module.exports = {requireAuth, verifyJWT  };
