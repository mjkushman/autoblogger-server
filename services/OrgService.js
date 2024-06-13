// import the org model
// const Models = require("../models/index");
// const db = require('../dborm')

const {Org} = require("../models");


class OrgService {
    
  /** GET all orgs */
  async findAll() {
    console.log('hit findAll Orgs function')
    return await Org.findAll()
  }
  /** GET ONE org */
  async findOne(orgId) {
    console.log('hit findAll Orgs function')
    return await Org.findOne({where:{orgId}})
  }


  /** POST creates a new org */
  async create(payload) {
    console.log('Orgs: Creating from payload:',payload)

    // TODO: Generate access key. hardcoding for now.
    let newOrg = {...payload,accessKey:"999"}

    return await Org.create(newOrg)
  }
}


module.exports = OrgService
