const { nanoid } = require("nanoid");
const { randomUUID } = require("crypto");

class IdGenerator {
  static agentId() {
    return `agt_${randomUUID()}`; // 40 char total
  };
  static blogId() {
    return `blg_${nanoid(10)}`; // 14 char total
  };
  static accountId() {
    return `act_${randomUUID()}`;
  };
  static postId() {
    return `pst_${nanoid(10)}`; // 14 char total
  };
  static userId() {
    return `usr_${randomUUID()}`; // 40 char total
  };
  static commentId() {
    return `cmt_${randomUUID()}`;
  };
  static statusId() {
    return `sts_${randomUUID()}`;
  };
}
module.exports = IdGenerator;
