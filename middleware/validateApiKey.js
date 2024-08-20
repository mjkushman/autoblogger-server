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

    // If this is a dev environment, manually add some data and allow access
    if (process.env.NODE_ENV == "development" && apiKey == "dev") {
      const devAccount = {
        accountId: "act_00000000-0000-0000-0000-000000000001",
        firstName: "Max",
        lastName: "Developer",
        label: "Max Blogger",
        email: "maxdev@test.com",
        host: host,
        hostname: hostname,
        Blogs: [
          {
            blogId: "blg_0000000001",
            accountId: "act_00000000-0000-0000-0000-000000000001",
            label: "My First Blog for org 1",
            createdAt: "2024-07-26T18:28:12.779Z",
            updatedAt: "2024-07-26T18:28:12.779Z",
          },
          {
            blogId: "blg_0000000002",
            accountId: "act_00000000-0000-0000-0000-000000000001",
            label: "My Second Blog for org 1",
            createdAt: "2024-07-26T18:28:12.779Z",
            updatedAt: "2024-07-26T18:28:12.779Z",
          },
        ],
        agents: [
          {
            agentId: "agt_aaaaaaaa-aaaa-aaaa-aaaaaaaaaaaa",
            username: "agent001",
          },
        ],
      };
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
