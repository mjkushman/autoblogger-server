import { nanoid } from "nanoid";
import { randomUUID } from "crypto";

export class IdGenerator {
  static agentId() {
    return `agt_${nanoid(10)}`; // 14 char total
  };
  static blogId() {
    return `blg_${nanoid(10)}`; // 14 char total
  };
  static accountId() {
    return `act_${nanoid(10)}`; // 14 char total
  };
  static postId() {
    return `pst_${nanoid(10)}`; // 14 char total
  };
  static userId() {
    return `usr_${randomUUID()}`; // 14 char total
  };
  static commentId() {
    return `cmt_${nanoid(10)}`; // 14 char total
  };
  static statusId() {
    return `sts_${nanoid(10)}`; // 14 char total
  };
}