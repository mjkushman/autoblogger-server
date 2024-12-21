const validDaysOfWeek = new Map([
  ["mon","mon"],
  ["tue","tue"],
  ["wed","wed"],
  ["thu","thu"],
  ["fri","fri"],
  ["sat","sat"],
  ["sun","sun"],
  [0, "sun"],
  [1, "mon"],
  [2, "tue"],
  [3, "wed"],
  [4, "thu"],
  [5, "fri"],
  [6, "sat"],
  [7, "sun"]
]);

/** Turns time and days into valid crontab expression,
 * @param time:string
 * @param daysOfWeek: string|number[]
 * @returns string valid crontab expression
 * */
function cronEncode({ time, daysOfWeek }) {
  console.log('ENCODING CRON')
  const [hour, minute] = time.split(":").map((string) => Number(string));

  if (!Number.isInteger(minute) || minute < 0 || minute > 59)
    throw new Error("minute must be between 0 and 59");
  if (!Number.isInteger(hour) || hour < 0 || hour > 23)
    throw new Error("hour must be between 0 and 23");
  for (let day of daysOfWeek) {
    
    
    if (!validDaysOfWeek.get(day)) {
      return new Error(
        `daysOfWeek must be an array of valid days: ${[...validDaysOfWeek.keys()]}`
      );
    }
    daysOfWeek[day] = validDaysOfWeek.get(day); //normalizes number or string to string
  }
  // if two of the same day are sent, just keep one
    if(daysOfWeek[0] === daysOfWeek[1]) daysOfWeek.pop()


  const cronExpression = `${minute} ${hour} * * ${daysOfWeek.join(",")}`;
  console.log("Produced cron expression: ", cronExpression);
  return cronExpression;
}

//   ┌──────────── minute
//   │ ┌────────── hour
//   │ │ ┌──────── day of month
//   │ │ │ ┌────── month
//   │ │ │ │ ┌──── day of week
//   │ │ │ │ │
//   │ │ │ │ │
//   * * * * *

/** Converts a crontab string into minute hour * * days
 * @param cronExpression: string like ' 33 12 * * sunday
 * @returns minute, hour, daysOfWeek
 *
 */
function cronDecode(cronExpression) {
  const cronArr = cronExpression.split(" ");
  const minute = Number(cronArr[0]);
  const hour = Number(cronArr[1]);
  const daysOfWeek = daysOfWeek[4].split(",").trim();

  return {
    time: `${hour}:${minute}`,
    daysOfWeek,
  };
}

module.exports = { cronDecode, cronEncode };
