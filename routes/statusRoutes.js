const express = require("express");

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  router.get("/:statusId", async function (req, res, next) {
    // route logic here
    try {
      const { statusId } = req.params;

    } catch (error) {
        return next(error)
    }
  });

  return router;
};
