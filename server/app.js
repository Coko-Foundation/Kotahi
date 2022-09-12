// server/app.js

// This is the express app your app will use

const { app } = require('@coko/server')
const schedule = require('../node_modules/node-schedule')
const { importManuscripts } = require('./model-manuscript/src/manuscriptCommsUtils')

// You can modify the app or ensure other things are imported here

schedule.scheduleJob('schedule', '00 21 * * *', () => {
  importManuscripts({user: null})
})

module.exports = app
