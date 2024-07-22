const { UniqueConstraintError, ValidationError } = require("sequelize");
const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} = require("../utilities/expressError");

const errorHandler = (err, req, res, next) => {
  console.log(`Middleware caught this error: ${err}`);
  console.dir(err);
  console.log('ERROR STACK')
  console.error(err.stack); // Logs the error stack for debugging

  if (err instanceof UniqueConstraintError) {
    // Handle Sequelize unique constraint error
    return res.status(409).json({
      status: err.type,
      message: err.message,
    });
  }
  if (err instanceof ValidationError) {
    // Handle Sequelize unique constraint error
    return res.status(401).json({
      status: err.type,
      message: err.message,
    });
  }
  if (err instanceof BadRequestError) {
    return res.status(err.status).json({
        status:`Error`,
        message: err.message
    })
  }
  if (err instanceof UnauthorizedError) {
    return res.status(err.status).json({
        status:`Error`,
        message: err.message
    })
  }
  if (err instanceof NotFoundError) {
    return res.status(err.status).json({
        status:`Error`,
        message: err.message
    })
  }
  if (err instanceof BadRequestError) {
    return res.status(err.status).json({
        status:`Error`,
        message: err.message
    })
  }

  // Handle other errors
  res.status(500).json({
    status: "This is the error handler middleware.",
    message: `An internal server error occurred.`,
  });
};

module.exports = errorHandler;
