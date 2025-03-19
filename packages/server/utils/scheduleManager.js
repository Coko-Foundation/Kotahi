const { logger } = require('@coko/server')
const schedule = require('node-schedule')

class ScheduleManager {
  constructor() {
    this.jobs = []
  }

  start(name, rule, func) {
    const existingJob = schedule.scheduledJobs[name]

    if (existingJob) {
      existingJob.cancel()
    }

    const job = schedule.scheduleJob(name, rule, func)
    logger.info(`Schedule ${name} started`)
    this.jobs.push(job)
    return job
  }

  stop(job) {
    job.cancel()
    const index = this.jobs.indexOf(job)

    if (index > -1) {
      this.jobs.splice(index, 1)
    }
  }

  stopAll() {
    this.jobs.forEach(job => {
      job.cancel()
    })
    logger.info(`Stopped all scheduled jobs`)
    this.jobs = []
  }
}

module.exports = ScheduleManager
