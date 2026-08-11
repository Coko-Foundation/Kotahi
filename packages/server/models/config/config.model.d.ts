import { BaseModel } from '@coko/server'

declare class Config extends BaseModel {
  active: boolean | null
  formData: any
  groupId: string | null
}

export = Config
