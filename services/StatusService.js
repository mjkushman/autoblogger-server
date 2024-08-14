const { Status } = require("../models");

class StatusService {
  // Finds a status
  static async findOne(statusId) {
    try {
      return await Status.findByPk(statusId)
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // Creates a new status
  static async create(type) {
    try {
      return await Status.create({
        type,
        status: "in_progress",
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }
// Updates a status instance
  static async updateInstance(instance, data) {
    try {
      instance.set(data);
      await instance.save();
      return instance;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = StatusService;
