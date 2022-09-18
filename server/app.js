// server/app.js

// This is the express app your app will use
const { app } = require('@coko/server')

// You can modify the app or ensure other things are imported here
const schedule = require('../node_modules/node-schedule')

const {
  importManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

schedule.scheduleJob({ tz: 'Etc/UTC', rule: '00 21 * * *' }, () => {
  // eslint-disable-next-line no-unused-expressions, no-sequences
  importManuscripts({ user: null })
})

module.exports = app
