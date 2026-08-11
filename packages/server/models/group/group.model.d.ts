import { BaseModel } from '@coko/server'

declare class Group extends BaseModel {
  name: string | null
  isArchived: boolean | null
  configs: Record<string, unknown>[]
}

export = Group
