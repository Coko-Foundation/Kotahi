const { app } = require('@coko/server')

// You can modify the app or ensure other things are imported here.
const schedule = require('../node_modules/node-schedule')

const {
  importManuscripts,
  archiveOldManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

schedule.scheduleJob({ tz: 'Etc/UTC', rule: '*/10 * * * * *' }, async () => {
  try {
    await importManuscripts({ user: null })
    await archiveOldManuscripts()
  } catch (error) {
    console.error(error)
  }
})

module.exports = app
