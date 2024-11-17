// "use strict";
const dotenv = require("dotenv");
dotenv.config();

const createApp = require("./app");

const { PORT, NODE_ENV } = require("./config");
const config = require("./config")[NODE_ENV];


// CREATE THE APP
const app = createApp(config);

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);

});
