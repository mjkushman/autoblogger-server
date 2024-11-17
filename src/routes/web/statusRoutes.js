const express = require("express");
const StatusService = require("../../services/StatusService");
const { NotFoundError } = require("../../utilities/expressError");

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  // top level route
    router.get("/", async function (req, res, next) {
    try {
      return res.sendResponse({ status: 200, data: null, message:"Provide a status ID to check the status" });
    } catch (error) {
      return next(error);
    }
  });

  router.get("/:statusId", async function (req, res, next) {
    // get a status
    try {
      const { statusId } = req.params;
      const status = await StatusService.findOne(statusId);
      if (!status) throw new NotFoundError("Item not found");
      return res.sendResponse({ status: 200, data: status });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
