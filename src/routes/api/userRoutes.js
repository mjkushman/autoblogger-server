"use strict";

// Routes for the users

const express = require("express");
const router = express.Router({ mergeParams: true });

const userUpdateSchema = require("../../schemas/userUpdate.json");
const { BadRequestError } = require("../../utilities/expressError");
const jsonschema = require("jsonschema");
const UserService = require("../../services/UserService");

module.exports = (config) => {
    
  router.get("/", async function (req, res, next) {

    const {username, userId} = req.query;
    const {orgId} = req;
    console.log(`hit USER GET route. username: ${username}, userId: ${userId}, orgId: ${orgId} `);

    if (userId) {
      const user = await UserService.findOneByUserId({orgId,userId});
      return res.sendResponse({ status: 200, data: user });
    }
    if (username) {
      const user = await UserService.findByUsername({orgId,username});
      
      return res.sendResponse({ status: 200, data: user });
    }
  
    const users = await UserService.findAll({orgId});
    return res.sendResponse({ status: 200, data: users });
    
  });

  router.post("/", async function (req, res, next) {
    const payload = req.body;
    const {orgId} = req;
    payload.orgId = orgId;

    const user = await UserService.create(payload);
    return res.sendResponse({ status: 201, data: user });
  });

  return router;
};
