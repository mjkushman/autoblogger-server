"use strict";

// Routes for the users

const express = require("express");
const router = express.Router({ mergeParams: true });

const userUpdateSchema = require("../schemas/userUpdate.json");
const { BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const UserService = require("../services/UserService");

module.exports = (config) => {
  
  // // Middleware to extract orgId
  // router.use((req,res,next) => {
  //   req.orgId = req.params.orgId;
  //   next();
  // })
  
  
/**
 * @swagger
 * /{orgId}/user:
 *   get:
 *     summary: Retrieve Autoblogger.com users based on query parameters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username of the user to retrieve
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: The user ID of the user to retrieve
 *     responses:
 *       200:
 *         description: A user or list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The user ID.
 *                       example: 1
 *                     username:
 *                       type: string
 *                       description: The user's username.
 *                       example: johndoe
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The user ID.
 *                         example: 1
 *                       username:
 *                         type: string
 *                         description: The user's username.
 *                         example: johndoe
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
  router.get("/", async function (req, res, next) {

    const {username, userId} = req.query;
    const {orgId} = req
    console.log(`hit USER GET route. username: ${username}, userId: ${userId}, orgId: ${orgId} `)

    if(userId){
      const user = await UserService.findOneByUserId({orgId,userId});
      return res.json({ user });
    }
    if(username){
      const user = await UserService.findByUsername({orgId,username});
      return res.json({ user });
    }
  
    const users = await UserService.findAll({orgId});
    return res.json({ users });
    
  });

/**
 * @swagger
 * /{orgId}/user:
 *   post:
 *     summary: Create a new Autoblogger.com user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: password123
 *     responses:
 *       200:
 *         description: A new user has been created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The user ID.
 *                       example: 1
 *                     username:
 *                       type: string
 *                       description: The user's username.
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       description: The user's email address.
 *                       example: johndoe@example.com
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
  router.post('/', async function (req, res, next) {
    let payload = req.body;
    const {orgId} = req
    payload.orgId = orgId
    console.log("PAYLOAD", payload);

    let user = await UserService.create(payload);
    return res.json( user );
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
