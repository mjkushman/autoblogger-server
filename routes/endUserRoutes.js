"use strict";

// Routes for the users

const express = require("express");
const router = express.Router({ mergeParams: true });

const userUpdateSchema = require("../schemas/userUpdate.json");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
// const { updateUserSql } = require("../utilities/sqlMapper");

/** GET / return all users
 *  if query param "authors=true" is passed, then only return authors
 *  if an id or username is provided, get the single user.
 *  If no id or username provided, get all users.
 */


module.exports = (config) => {
  // Middleware to extract orgId

  router.use((req,res,next) => {
    req.orgId = req.params.orgId;
    next();
  })
  
  const EndUserService = require("../services/EndUserService");
  const endUserService = new EndUserService(config.database.client);
  
  router.get("/", async function (req, res, next) {
    // const id = req.query.user_id;
    const {username, userId} = req.query;
    const {orgId} = req

    if(userId){
      const user = await endUserService.findByUserId(orgId,userId);
      return res.json({ user });
    }
    if(username){
      const user = await endUserService.findByUsername(orgId,username);
      return res.json({ user });
    }
    const users = await endUserService.findAll(orgId);
    return res.json({ users });
    
  });



  router.post('/', async function (req, res, next) {
    const payload = req.body;
    const {orgId} = req
    console.log("PAYLOAD (req.body)", payload);
    let data = await endUserService.create(orgId,payload);
    return res.json({ data });


  })


    // BEFORE SEQUELIZE:
    // if(id) {
    //   try {
    //       // console.log("getting user by user_id");
    //       const user = await User.getUser('user_id',id);
    //     return res.json({ user });
    //   } catch (error) {
    //     return next(error);
    //   }
    // } else if (username) {
    //   try {
    //       // console.log("getting user by username");
    //       const user = await User.getUser('username',username);
    //     return res.json({ user });
    //   } catch (error) {
    //     return next(error);
    //   }
    // } else {
    //   try {
    //     // console.log("getting all users");
    //     const authors = req.query.authors == "true";
    //     const users = await User.getAllUsers(authors);
    //     return res.json({ users });
    //   } catch (error) {
    //     return next(error);
    //   }
    // }
  

  /** GET / return a single user and all posts and comments written by that user
   *
   * Logic determines if the identifier is a username or a uuid, then passes along the correct label
   */

  // DEPRECATED

  // router.get("/:identifier", async function (req, res, next) {
  //   try {
  //     const user = await User.getUser(req.params.username);
  //     return res.json({ user });
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  /** PATCH / Update information about a user
   * User may udpate themselves. Admin may update anyone
   * Correct password required for any update
   * All other fields options.
   * Must only update fields that have changes
   */

  // router.patch("/:id", async function (req, res, next) {
  //   try {
  //     const validator = jsonschema.validate(req.body, userUpdateSchema);
  //     if (!validator.valid) {
  //       const errors = validator.errors.map((e) => e.stack);
  //       let message = new BadRequestError(errors);
  //       return res.status(400).json({ message: message, errors: errors });
  //     }
  //     const userId = req.params.id;

  //     // console.log('patch received:',req.body)

  //     // get the columns to update and their values
  //     let { updateCols, updateVals } = updateUserSql(req.body);

  //     const user = await User.updateUser(userId, updateCols, updateVals);

  //     return res.status(200).json({ user });
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  return router;
};
