"use strict";

import jwt from"jsonwebtoken";
import config from "../config";
import {
  ExpressError,
  UnauthorizedError,
  NotFoundError,
} from "../utilities/expressError";
import AccountService from "../services/AccountService";
import { cache } from "../cache";
import bcrypt from "bcrypt";

/** Middleware for requiring authorizations
 *
 *
 */

/** Middleware to store the contents of the JWT on res.locals.user
 * If no token, also return next
 * Token is not needed. But it will only store res.locals.user if a valid token is provided.
 */
export function verifyJWT(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    if (authHeader) {
      console.log("found header: ", authHeader);
      console.log('ABOUT TO JWT VERIFY WITH SECRET KEY:', config.SECRET_KEY)
      let token = authHeader
        .replace(/^[Bb]earer\s+["']?([^"']+)["']?$/, "$1")
        .trim(); // strip "bearer" and any quotes from the token
      console.log('TOKEN:', token)
      console.log('VERIFYING', jwt.verify(token, config.SECRET_KEY))
        req.user = jwt.verify(token, config.SECRET_KEY);
      console.log("stored user token to req.user", req.user);
    }
    return next();
  } catch (error) {
    console.log(error)
    return next();
  }
}

/** Makes sure a user is logged in by checking for a user object on res.locals
 * The function above, verifyJWT, will set res.locals.user if a valid token is provided
 */
export function requireAuth(req, res, next) {
  try {
    if (req.user == null) throw new UnauthorizedError();
    return next();
  } catch (error) {
    return next(error);
  }
}

// Validate the API key and attached the retrieved account to the request
export async function validateApiKey(req, res, next) {
  const apiKey = req.headers["X-API-KEY"] || req.headers["x-api-key"];
  const hostname = req.hostname; // host from headers
  const host = req.headers.host; // host from headers

  // If this is a dev environment, provide a dev account
  if (process.env.NODE_ENV == "development" && apiKey == "dev") {
    const devAccount = await AccountService.findByApiKeyIndex({
      apiKey: "01.123456789012345678901234567890",
    });

    console.log("continuing in dev environment" );
    // console.log(devAccount);
    req.account = devAccount;
    // console.log(req.account);
    // console.log(req);
    cache.set(apiKey, devAccount);
    return next();
  }
  try {
    // make sure API exists
    if (!apiKey || apiKey === "") {
      throw new UnauthorizedError(
        "Unauthorized. Please include X-API-KEY in request header.",
        401
      );
    }

    // Check the cache for this api key. If found, return early.
    const cachedAccount = cache.get(apiKey);
    if (cachedAccount) {
      req.account = cachedAccount;
      return next();
    }

    // Lookup the user by api key index
    const account = await AccountService.findByApiKeyIndex({ apiKey });
    if (!account) {
      throw new NotFoundError("Invalid api key", 404);
    }
    // Compare the retrieved dev apiKey with provided Key
    if (account) {
      bcrypt.compare(apiKey, account.apiKey, (error, result) => {
        if (error) {
          throw new ExpressError(error, 401);
        }
        if (result) {
          // Store the retrieved developer
          cache.set(apiKey, account);
          //   console.log(`CACHED!:`, developer)

          // This must is a valid developer
          req.account = account;
        }
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

// module.exports = { requireAuth, verifyJWT, validateApiKey };
