// import the org model
// const Models = require("../models/index");
// const db = require('../dborm')

const { Org } = require("../models");
const crypto = require('crypto')
class OrgService {
  /** GET all orgs */
  static async findAll() {
    console.log("hit findAll Orgs function");
    return await Org.findAll();
  }
  /** GET ONE org */
  static async findOne(orgId) {
    console.log("hit findAll Orgs function");
    return await Org.findOne({ where: { orgId } });
  }

  
  /** POST creates a new org */
  static async create(payload) {
    console.log("Orgs: Creating from payload:", payload);


    let accessKey = crypto.randomBytes(64).toString('hex')
    let newOrg = {
      email: payload.email,
      name: payload.name,
      plan: payload.plan,
      accessKey,
    };

    return await Org.create(newOrg);
  }
}

module.exports = OrgService;
