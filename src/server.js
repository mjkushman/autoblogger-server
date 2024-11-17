// "use strict";
var dotenv = require("dotenv");
dotenv.config();
var createApp = require("./app");
console.log('PROCRESS ENV', process.env.NODE_ENV);
var _a = require("./config"), PORT = _a.PORT, NODE_ENV = _a.NODE_ENV;
var config = require("./config")[NODE_ENV];
// CREATE THE APP
var app = createApp(config);
app.listen(PORT, function () {
    console.log("Started on http://localhost:".concat(PORT));
});
