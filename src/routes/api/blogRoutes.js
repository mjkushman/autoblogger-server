"use string";
const express = require("express");
const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  const BlogService = require("../../services/BlogService");

  router.get("/", async function (req, res, next) {
    const blogs = await BlogService.findAll();
    return res.sendResponse({status:200, data: blogs})
  });

  router.get("/:blogId", async function (req, res, next) {
    const blog = await BlogService.findOne(req.params.blogId);
    return res.sendResponse({status:200, data: blog})
  });

  //
  router.post("/", async function (req, res, next) {
    // const payload = req.body;
    const blog = await BlogService.create(req.body);
    return res.sendResponse({status:200, data: blog})
  });
  return router;
};
