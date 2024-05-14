const { BaseModel } = require('@coko/server')

// model
class TaskAlert extends BaseModel {
  static get tableName() {
    return 'task_alerts'
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
      },
    }
  }
}

TaskAlert.type = 'TaskAlert'
module.exports = TaskAlert
