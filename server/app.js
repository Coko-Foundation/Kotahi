const { app } = require('@coko/server')

// You can modify the app or ensure other things are imported here or you can use this to define functions globally here.
const schedule = require('../node_modules/node-schedule')

const {
  importManuscripts,
  archiveOldManuscripts,
} = require('./model-manuscript/src/manuscriptCommsUtils')

schedule.scheduleJob({ tz: 'Etc/UTC', rule: '00 21 * * *' }, async () => {
  try {
    importManuscripts({ user: null })
    await archiveOldManuscripts()
  } catch (error) {
    console.error(error)
  }
})

module.exports = app
