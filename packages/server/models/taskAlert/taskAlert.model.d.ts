import { BaseModel } from '@coko/server'

declare class TaskAlert extends BaseModel {
  taskId: string
  userId: string
}

export = TaskAlert
