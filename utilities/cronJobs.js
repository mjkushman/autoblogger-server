const cron = require('node-cron')

// blog cleo every day

/**
 * node cron
 * https://www.npmjs.com/package/node-cron
 * 
    ┌────────────── second (optional)
    │ ┌──────────── minute
    │ │ ┌────────── hour
    │ │ │ ┌──────── day of month
    │ │ │ │ ┌────── month
    │ │ │ │ │ ┌──── day of week
    │ │ │ │ │ │
    │ │ │ │ │ │
    * * 12 * * *
 */

// run on the 30th minute of the 12th hour of each day ==> 12:30pm
cron.schedule('30 12 * * *', () => {
    console.log('running a task at 12:30')
});

// run on the Nth minute of the Nth hour of each day
cron.schedule('20 10 * * *', () => {
    console.log('running a task at 10:20')
});
cron.schedule('21 10 * * *', () => {
    console.log('running a task at 10:21')
});

cron.schedule('*/5 * * * *', () => {
    console.log('running a task every 5 minutes')
});