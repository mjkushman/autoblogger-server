"use strict";

// Routes for the users

const express = require("express");
const router = express.Router({ mergeParams: true });

const { BadRequestError } = require("../expressError");

module.exports = (config) => {
  const UserService = require("../services/UserService");
  const userService = new UserService(config.database.client);

  /**
   * @swagger
   * /admin/users:
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
    // const id = req.query.user_id;
    const { username, userId, orgId } = req.query;


    if (userId) {
      const user = await userService.findOneByUserId({ userId });
      return res.json({ user });
    }
    if (username) {
      const user = await userService.findByUsername({orgId, username});
      return res.json({ user });
    }
    const users = await userService.findAll({orgId});
    return res.json({ users });
  });

  /**
   * @swagger
   * /admin/user:
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
   *       201:
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
  router.post("/", async function (req, res, next) {
    const payload = req.body;
    console.log("PAYLOAD (req.body) and ORGID", payload);

    let user = await userService.create( payload );
    return res.json({ user });
  });

  return router;
};
