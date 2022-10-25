const moment = require('moment-timezone')
const config = require('config')
const Task = require('./task')

const populateTemplatedTasksForManuscript = async manuscriptId => {
  const newTasks = await Task.query()
    .whereNull('manuscriptId')
    .orderBy('sequenceIndex')

  const existingTasks = await Task.query()
    .where({ manuscriptId })
    .orderBy('sequenceIndex')

  const endOfToday = moment().tz(config.manuscripts.teamTimezone).endOf('day')

  return Task.transaction(async () => {
    const promises = []

    for (let i = 0; i < newTasks.length; i += 1) {
      const task = {
        ...newTasks[i],
        manuscriptId,
        dueDate: moment(endOfToday)
          .add(newTasks[i].defaultDurationDays, 'days')
          .toDate(),
        sequenceIndex: i + existingTasks.length,
      }

      delete task.id // So a new id will be assigned
      promises.push(
        Task.query().insertAndFetch(task).withGraphFetched('assignee'),
      )
    }

    return existingTasks.concat(
      (await Promise.all(promises)).sort(
        (a, b) => a.sequenceIndex - b.sequenceIndex,
      ),
    )
  })
}

module.exports = {
  populateTemplatedTasksForManuscript,
}
