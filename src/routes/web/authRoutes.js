"use strict";

// Routes for the users

// const {User} = require('../models') // import blog model from models folder
const express = require("express");
const jsonschema = require("jsonschema");
const registerSchema = require("../../schemas/userRegister.json");
const userAuthSchema = require("../../schemas/userAuthenticate.json");
const { BadRequestError } = require("../../utilities/expressError");
import AuthService from "../../services/AuthService";

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  // Returns a valid token
  router.get("/", async function (req, res, next) {
    // console.log('PRE AUTH RES LOCALS',{...res.locals})
    try {
      return res.sendResponse({ status: 200, data: null, message: "hello world",
      });
    } catch (error) {
      return next(error);
    }
  });
  // Returns a valid token
  router.post("/", async function (req, res, next) {
    console.log("authentication request recieved");
    // console.log('PRE AUTH RES LOCALS',{...res.locals})
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new BadRequestError("Request must contain email and password");

      const token = await AuthService.authenticate({ email, password });
      console.log("route, token", token);
      return res.sendResponse({ status: 201, data: token });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
