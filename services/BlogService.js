// import the org model
// const Models = require("../models/index");
// const db = require('../dborm')

const {Blog} = require("../models");


class BlogService {
    
  /** GET all orgs */
  static async findAll() {
    console.log('hit findAll Blogs function')
    return await Blog.findAll()
  }
  /** GET ONE org */
  static async findOne(blogId) {
    console.log('hit findOne OrBlogsgs function')
    return await Blog.findOne({where:{blogId}})
  }


  /** POST creates a new org */
  static async create(payload) {
    console.log('Blogs: Creating from payload:',payload)
    
    return await Blog.create(payload)
  }
}


module.exports = BlogService
