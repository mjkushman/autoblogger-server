const {
  ExpressError,
  UnauthorizedError,
  NotFoundError,
} = require("../utilities/expressError");
const developerService = require("../services/AccountService");
const { cache } = require("../cache");
const bcrypt = require("bcrypt");

module.exports = {
  async validateApiKey(req, res, next) {
    const apiKey = req.headers["X-API-KEY"] || req.headers["x-api-key"];
    const host = req.headers.host // host from headers
  

    // If this is a dev environment, manually add some data and allow access
    if(process.env.NODE_ENV == 'development' && apiKey == 'dev') {
      const devForDev = {
        accountId: "11111111-1111-1111-1111-111111111111",
        firstName: 'Max',
        lastName: 'Developer',
        label: 'Max Blog',
        email: 'maxdev@test.com',
        host: host
      }
      console.log('continuing in dev environment', devForDev)
      req.user = devForDev;
      cache.set(apiKey, devForDev)
      return next()
    }
    try {
      
      // make sure API exists
      if (!apiKey || apiKey === "")
        throw new UnauthorizedError(
          "Unauthorized. Please include X-API-KEY in request header.",
          401
        );

      // Check the cache for this api key. If found, return early.
      const cachedDeveloper = cache.get(apiKey);
      if (cachedDeveloper) {
        req.user = cachedDeveloper;
        // console.log('FOUND USER IN CACHE')
        return next();
      }

      // Lookup the user by api key index
      const developer = await developerService.findByApiKeyIndex({ apiKey });
      if (!developer) {
        throw new NotFoundError("Invalid api key", 404);
      }
      // Compare the retrieved dev apiKey with provided Key
      if (developer) {
          bcrypt.compare(apiKey, developer.apiKey, (error, result) => {
            if (error) {
              throw new ExpressError(error, 401);
            }
            if (result) {
              // Store the retrieved developer
              cache.set(apiKey, developer);
              //   console.log(`CACHED!:`, developer)
    
              // This must is a valid developer
              req.user = developer;
            }
          });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  },
};
