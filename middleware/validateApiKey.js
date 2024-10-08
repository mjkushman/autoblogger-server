const {
  ExpressError,
  UnauthorizedError,
  NotFoundError,
} = require("../utilities/expressError");
const AccountService = require("../services/AccountService");
const { cache } = require("../cache");
const bcrypt = require("bcrypt");

module.exports = {
  // Validate the API key and attached the retrieved account to the request
  async validateApiKey(req, res, next) {
    const apiKey = req.headers["X-API-KEY"] || req.headers["x-api-key"];
    const hostname = req.hostname; // host from headers
    const host = req.headers.host; // host from headers

    // If this is a dev environment, provide a dev account
    if (process.env.NODE_ENV == "development" && apiKey == "dev") {
      
      const devAccount = await AccountService.findByApiKeyIndex({apiKey:"01.123456789012345678901234567890"})
      
      console.log("continuing in dev environment", devAccount);
      req.account = devAccount;
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
        // console.log('FOUND USER IN CACHE')
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
  },
};
