const {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} = require("sequelize");
const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} = require("../utilities/expressError");

const errorHandler = (err, req, res, next) => {
  console.log(`On request to ${req.url}`)
  console.log(`Middleware caught this error: ${err}
    
     `);

  console.error(err.stack); // Logs the error stack for debugging

  if (err instanceof ForeignKeyConstraintError) {
    // Handle Sequelize Foreign key constraint error
    console.log(err)
    return res.status(409).json({
      status: err.type,
      message: `Please check the request paremeters.`,
    });
  }
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
      status: `Error`,
      message: err.message,
    });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(err.status).json({
      status: `Error`,
      message: err.message,
    });
  }
  if (err instanceof NotFoundError) {
    return res.status(err.status).json({
      status: `Error`,
      message: err.message,
    });
  }
  if (err instanceof BadRequestError) {
    return res.status(err.status).json({
      status: `Error`,
      message: err.message,
    });
  }

  // Handle other errors
  res.status(500).json({
    message: `An internal server error occurred.`,
  });
};

module.exports = errorHandler;
