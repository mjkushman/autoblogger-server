"use strict";

// Routes for Org Users. These are users who use Autoblogger's business website. They need to sign in and create an org.

const OrgUser = require("./orgUser"); // import blog model from models folder
const express = require("express");
const router = express.Router({ mergeParams: true });

const userUpdateSchema = require("../schemas/userUpdate.json");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const { updateUserSql } = require("../utilities/sqlMapper");

/** GET / ALL org users
 */
router.get("/", async function (req, res, next) {
  try {
    const user = await OrgUser.getUser(id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/** GET / ONE org user
 */
router.get("/:userId", async function (req, res, next) {
  try {
    const user = await OrgUser.getOne(req.params.userId);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/** PATCH / Update information about a user
 * User may udpate themselves. Admin may update anyone
 * Correct password required for any update
 * All other fields options.
 * Must only update fields that have changes
 */
router.patch("/:userId", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errors = validator.errors.map((e) => e.stack);
      let message = new BadRequestError(errors);
      return res.status(400).json({ message: message, errors: errors });
    }
    const userId = req.params.userId;

    // console.log('patch received:',req.body)

    // get the columns to update and their values
    let { updateCols, updateVals } = updateUserSql(req.body);

    const user = await OrgUser.updateUser(userId, updateCols, updateVals);

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
