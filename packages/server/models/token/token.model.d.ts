import { BaseModel } from '@coko/server'

declare class Token extends BaseModel {
  name: string
  value: string
  groupId: string
}

export = Token
