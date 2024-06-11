// import the org model
// const Models = require("../models/index");
// const db = require('../dborm')

const createModels = require("../models");

// console.log(`ORG SERVICE ORG MODEL: ${Org2}`)


class OrgService {

  constructor(sequelize) {
    createModels(sequelize);
    
    // Do I need this next line?
    this.client = sequelize;
    this.model = sequelize.models.orgs;
    
  }
  
  async findAll() {
    console.log('hit getOrg function')
    
    // console.log('sequelize.models:', sequelize.models)
    // console.log('this.model:', this.model)
    // console.log('model type:', typeof(this.model))

    const orgs = await this.model.findAll()
    // console.log('findAll result:')
    // console.log(orgs)
    
    return  orgs
  }

  async create(payload) {
    console.log('Orgs: Create')

    console.log(payload)
    // TODO: Generate access key
    let org = {...payload,"access_key":"999"}

    const result = await this.model.create(org)
    return result
  }
}


module.exports = OrgService
