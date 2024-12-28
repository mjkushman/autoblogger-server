"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const db = require("../../db.js");
const User = require("./User.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET users and GET functions", () => {
  test("gets all users", async () => {
    let result = await User.getAllUsers();
    expect(result.length).toBeGreaterThan(0);
  });
  test("gets a single user by username", async () => {
    let result = await User.getUser("username", "testuser1");
    console.log(result);
    expect(result.username).toBe("testuser1");
    expect(result.userId).toBe("c2250ab6-5a6b-4ca0-9052-35db36ff6e79");
    expect(result.email).toBe("testuser1@gmail.com");
  });
  test("gets a single user by userId", async () => {
    let result = await User.getUser(
      "user_id",
      "c2250ab6-5a6b-4ca0-9052-35db36ff6e79"
    );
    console.log(result);
    expect(result.username).toBe("testuser1");
    expect(result.userId).toBe("c2250ab6-5a6b-4ca0-9052-35db36ff6e79");
    expect(result.email).toBe("testuser1@gmail.com");
  });
  test("Getting an invalid username resutls in error", async () => {
    
    try {
        await User.getUser("username", "notauser");
    } catch (error) {
        expect(error instanceof NotFoundError).toBeTruthy()
    }
  });
});


describe("Create users ", () => {    
    let newTestUser = {
        username:'newtestuser1',
        password:'123456',
        firstName:'newtestuser1-fn',
        lastName:'newtestuser1-ln',
        email:'newtestuser1@gmail.com',
        authorBio:'test bio'
    }
    test('Creates a new user', async () => {
        let result = await User.register(newTestUser);
        expect(result.username).toBe('newtestuser1')
        expect(result.password).toBeUndefined()
    })
    test('Cannot create duplicate users', async () => {
        await User.register(newTestUser);
        try {
            await User.register(newTestUser);
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy()
        }

    })
})
