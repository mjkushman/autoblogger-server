import cronEncoder from "../../utilities/cronEncoder";
import validatePostSettings from "../../utilities/validatePostSettings";

describe("cronEncoder", () => {
  test("encodes a time and day names", () => {
    expect(cronEncoder({ time: "09:30", daysOfWeek: ["mon", "wed"] })).toBe("30 09 * * mon,wed");
  });

  test("accepts day numbers, mixed case, and maps 0 and 7 to sunday", () => {
    expect(cronEncoder({ time: "08:00", daysOfWeek: [0, "TUE", 7] })).toBe("00 08 * * sun,tue");
  });

  test("removes duplicate days", () => {
    expect(cronEncoder({ time: "12:00", daysOfWeek: ["mon", 1, "MON"] })).toBe("00 12 * * mon");
  });

  test.each([
    ["an unknown day", "12:00", ["funday"]],
    ["an hour past 23", "25:00", ["mon"]],
    ["a minute past 59", "12:75", ["mon"]],
    ["a time with no colon", "noon", ["mon"]],
  ])("rejects %s with a 400", (_name, time, daysOfWeek) => {
    expect.assertions(2);
    try {
      cronEncoder({ time, daysOfWeek });
    } catch (e) {
      expect(e.status).toBe(400);
      expect(e.message).toBe("Invalid crontab");
    }
  });
});

describe("validatePostSettings", () => {
  const valid: any = { time: "09:00", daysOfWeek: ["mon"], timezone: "UTC" };

  test("accepts time, days and timezone", () => {
    expect(validatePostSettings(valid)).toBe(true);
  });

  test.each(["time", "daysOfWeek", "timezone"])("rejects a missing %s", (field) => {
    expect(validatePostSettings({ ...valid, [field]: undefined })).toBe(false);
  });
});
