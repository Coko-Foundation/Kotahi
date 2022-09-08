// server/app.js

// This is the express app your app will use

const { app } = require('@coko/server')
const schedule = require('../node_modules/node-schedule')

// You can modify the app or ensure other things are imported here

schedule.scheduleJob('m-job', '* * * * *', () => {
  // eslint-disable-next-line no-console
  importManuscripts({user: null})
})

module.exports = app
