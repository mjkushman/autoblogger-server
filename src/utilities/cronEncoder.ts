import cron from "node-cron";
import { BadRequestError } from "./expressError";

const validDaysOfWeek = new Map([
  ["mon", "mon"],
  ["tue", "tue"],
  ["wed", "wed"],
  ["thu", "thu"],
  ["fri", "fri"],
  ["sat", "sat"],
  ["sun", "sun"],
  ["0", "sun"],
  ["1", "mon"],
  ["2", "tue"],
  ["3", "wed"],
  ["4", "thu"],
  ["5", "fri"],
  ["6", "sat"],
  ["7", "sun"],
]);

/** Turns time and days into valid crontab expression,
 * @param time:string
 * @param daysOfWeek: string|number[]
 * @returns string valid crontab expression
 * */
function cronEncoder({
  time,
  daysOfWeek,
}: {
  time: string;
  daysOfWeek: (string | number)[];
}): string {
  console.log("ENCODING CRON");
  const [hour, minute] = time.split(":");
  const days = new Set(
    daysOfWeek.map((day: number | string) => {
      return validDaysOfWeek.get(String(day).toLowerCase());
    })
  );
  const daysArr = Array.from(days.values());
  const cronTab = `${minute} ${hour} * * ${daysArr.join(",")}`;

  if (!cron.validate(cronTab)) throw new BadRequestError("Invalid crontab");

  console.log("Produced cronTab: ", cronTab);
  return cronTab;
}

export default cronEncoder;
