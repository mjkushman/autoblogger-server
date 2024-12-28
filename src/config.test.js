"use strict";

describe("config can come from env", function () {
  
  test("works", function() {
    
    // console.log('pre test config options')
    // console.log("SECRET_KEY")
    // console.log(process.env.SECRET_KEY)
    // console.log("PORT")
    // console.log(process.env.PORT)
    // console.log("DATABASE_URL")
    // console.log(process.env.DATABASE_URL)
    // console.log("NODE_ENV")
    // console.log(process.env.NODE_ENV)
    
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";
    
    
    const config = require("./config");
    
    
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);
    


    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL; // forces URL back to default value

    expect(config.getDatabaseUri()).toEqual("autoblogger");
    process.env.NODE_ENV = "test"; 

    expect(config.getDatabaseUri()).toEqual("autoblogger_test");
    
  });
  test("loads env variables", function() {

    expect(process.env.OPEN_AI_KEY).toEqual(expect.any(String))
    expect(process.env.UNSPLASH_CLIENT_ID).toEqual(expect.any(String))
    
  });
})

