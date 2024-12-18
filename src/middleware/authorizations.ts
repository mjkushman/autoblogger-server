"use strict";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
// import config from "@/config";
import {
  ExpressError,
  UnauthorizedError,
  NotFoundError,
} from "../utilities/expressError";
import AccountService from "../services/AccountService";
import { cache } from "@/cache";
import bcrypt from "bcrypt";

/** Middleware for requiring authorizations
 *
 *
 */

/** Middleware to store the contents of the JWT on res.locals.user
 * If no token, also return next
 * Token is not needed. But it will only store res.locals.user if a valid token is provided.
 */
export async function verifyJWT(
  // req: Request & {locals?: {account?: any}},
  req: Request,
  _res: Response,
  next: NextFunction
) {
  console.log("inside verifyJWT");
  console.log(req.headers);
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    try {
      let token = authHeader
        .replace(/^[Bb]earer\s+["']?([^"']+)["']?$/, "$1")
        .trim(); // strip "bearer" and any quotes from the token

      // lookup account by accountId

      jwt.verify(token, config.SECRET_KEY, async (err, decoded: JwtPayload) => {
        if (err) {
          console.log("Error decoding token: ", err);
          return next();
        }
        console.log("Decoded token ", decoded);
        // TODO: check cache for account before looking up in db

        // look up account in db
        await AccountService.findOne(decoded.accountId).then((account) => {
          if (!req.locals) req.locals = {};
          req.locals.account = account;
          console.log('STORED ACCOUNT:', req.locals.account)
          return next();
        }, (err) => {
          console.log('Error retrieving account:, ', err);
          return next();
        });
      });
    } catch (error) {
      console.log(error);
      return next();
    }
  }
  else return next();
}

/** Makes sure a user is logged in by checking for a user object on res.locals
 * The function above, verifyJWT, will set res.locals.user if a valid token is provided
 */
export function requireAuth(req, res, next) {
  try {
    if (req.locals.account == null) throw new UnauthorizedError();
    return next();
  } catch (error) {
    return next(error);
  }
}

// Validate the API key and attached the retrieved account to the request
export async function validateApiKey(req, res: Response, next: NextFunction) {
  const apiKey = req.headers["X-API-KEY"] || req.headers["x-api-key"];
  const hostname = req.hostname; // host from headers
  const host = req.headers.host; // host from headers
  if(!req.locals) req.locals = {}

  // If this is a dev environment, provide a dev account
  if (process.env.NODE_ENV == "development" && apiKey == "dev") {
    const devAccount = await AccountService.findByApiKeyIndex({
      apiKey: "01.123456789012345678901234567890",
    });

    console.log("continuing in dev environment");
    // console.log(devAccount);
    req.locals.account = devAccount;
    cache.set(apiKey, devAccount);
    return next();
  }
  try {
    // make sure API exists
    if (!apiKey || apiKey === "") {
      throw new UnauthorizedError(
        "Unauthorized. Please include X-API-KEY in request header."
      );
    }

    // Check the cache for this api key. If found, return early.
    const cachedAccount = cache.get(apiKey);
    if (cachedAccount) {
      req.locals.account = cachedAccount;
      return next();
    }

    // Lookup the user by api key index
    const account = await AccountService.findByApiKeyIndex({ apiKey });
    if (!account) {
      throw new NotFoundError("Invalid api key");
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
          req.locals.account = account;
        }
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
