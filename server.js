"use strict";

const app = require("./app");
const { PORT } = require("./config");
const cron = require('node-cron')
// const aiWritePost = require('./utilities/aiWritePost')
const aiBlogger = require('./utilities/aiBlogger')


// Create the blogger: Cleo

const cleo = async () => {
  let blogger = await aiBlogger('cleo')
  let outline = await blogger.createOutline()
  blogger.writeBlogPost(outline)
  return blogger
}


// Create the blogger: Max

const max = async () => {
  let blogger = await aiBlogger('max')
  let outline = await blogger.createOutline()
  blogger.writeBlogPost(outline)
  return blogger
}

// cleo()
// max()

// Schedule the autoblogger

// UNCOMMENT THIS TO START AUTO BLOGGING

// cron.schedule('* * */1 * *', async () => {
//   console.log('Running AI blogger')
//   try {
//     await cleo()
//     console.log('Finished running cleo')
//     await max()
//     console.log('Finished running max')
//   } catch (error) {
//     console.log('Error running aiBlogger in cron:',error)
//   }
// });











app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
