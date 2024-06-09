"use strict";

/** Express app for AUTOBLOGGER. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");
const postRoutes = require("./routes/postRoutes");
const { verifyJWT } = require("./middleware/authorizations");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/userRoutes");
const agentRoutes = require("./agents/agentRoutes");
const orgRoutes = require("./orgs/orgRoutes");
const orgUserRoutes = require("./orgUser/orgUserRoutes")
const morgan = require("morgan");


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(verifyJWT); // stores decoded token on res.locals.user, if one is provided

app.use("/auth", authRoutes);
app.use("/agents", agentRoutes);
app.use("/orgs", orgRoutes);
app.use("/orgusers",orgUserRoutes);

app.use("/users", usersRoutes);
app.use("/posts", postRoutes);






/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
