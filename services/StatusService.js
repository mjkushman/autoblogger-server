const { Status } = require("../models");

class StatusService {
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

  static async update({ statusId, status }) {
    try {
      const sts = await Status.findByPk(statusId);
      sts.update(status);
      sts.save();
      return sts;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = StatusService;
