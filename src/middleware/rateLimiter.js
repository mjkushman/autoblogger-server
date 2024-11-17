const rateLimit = require("express-rate-limit");


const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: "Too many requests, please wait a few minutes.",
  });


module.exports = rateLimiter