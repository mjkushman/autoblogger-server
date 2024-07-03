"use string";
const express = require("express");
const router = express.Router({ mergeParams: true });

// ====== NEW SEQUELIZE SERVICE HERE
// Receives config from routes/index.js
module.exports = (config) => {
  const BlogService = require("../services/BlogService");
  const blogService = new BlogService(config.database.client);
  // ====== END NEW SEQUELIZE SERVICE

  /** Get all blogs
   * @swagger
   * /blogs:
   *   get:
   *     summary: Retrieve all organizations
   *     tags: [Blogs]
   *     responses:
   *       200:
   *         description: A list of blogs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 orgs:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         description: The organization ID.
   *                         example: 1
   *                       name:
   *                         type: string
   *                         description: The name of the organization.
   *                         example: Autoblogger Org
   *                       address:
   *                         type: string
   *                         description: The address of the organization.
   *                         example: 123 Main St, Springfield, USA
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  router.get("/", async function (req, res, next) {
    const blogs = await blogService.findAll();
    return res.json({ blogs });
  });

  /** Get a single blog
   * @swagger
   * /blogs/{blogId}:
   *   get:
   *     summary: Retrieve a single blog
   *     tags: [Blogs]
   *     parameters:
   *       - in: path
   *         name: orgId
   *         schema:
   *           type: string
   *         required: true
   *         description: The ID of the organization to retrieve
   *     responses:
   *       200:
   *         description: A blog object
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 org:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: The organization ID.
   *                       example: 1
   *                     name:
   *                       type: string
   *                       description: The name of the organization.
   *                       example: Autoblogger Org
   *                     address:
   *                       type: string
   *                       description: The address of the organization.
   *                       example: 123 Main St, Springfield, USA
   *       400:
   *         description: Bad request
   *       404:
   *         description: Organization not found
   *       500:
   *         description: Internal server error
   */
  router.get("/:blogId", async function (req, res, next) {
    const blog = await blogService.findOne(req.params.blogId);
    return res.json({ blog });
  });

  //
  /** Create an org
   * @swagger
   * /orgs:
   *   post:
   *     summary: Create a new organization
   *     tags: [Organization]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: The name of the organization
   *                 example: Autoblogger Org
   *               address:
   *                 type: string
   *                 description: The address of the organization
   *                 example: 123 Main St, Springfield, USA
   *               email:
   *                 type: string
   *                 description: The email address of the organization
   *                 example: contact@autoblogger.org
   *     responses:
   *       200:
   *         description: A new organization has been created
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
   *                       description: The organization ID.
   *                       example: 1
   *                     name:
   *                       type: string
   *                       description: The name of the organization.
   *                       example: Autoblogger Org
   *                     address:
   *                       type: string
   *                       description: The address of the organization.
   *                       example: 123 Main St, Springfield, USA
   *                     email:
   *                       type: string
   *                       description: The email address of the organization.
   *                       example: contact@autoblogger.org
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  router.post("/", async function (req, res, next) {
    // const payload = req.body;
    let blog = await blogService.create(req.body);
    return res.json( blog );

    // BEFORE SEQUELIZE:
    // try {

    //     const validator = jsonschema.validate(req.body,createOrgSchema)

    //     if(!validator.valid){
    //     const errors = validator.errors.map((e) => e.stack);
    //         let status = new BadRequestError("You can't do that")
    //       return(res.status(400).json({status,errors:errors}))
    //     }
    //     const {name,contactEmail,plan} = req.body

    //     const result = await Org.createOrg(name,contactEmail,plan)
    //     return res.status(201).json({org:result})
    // } catch (error) {
    //     console.log(`Error creating a new org: ${error}`)
    //     return json({message:"Something messed up"})
    // }
  });
  return router;
};
