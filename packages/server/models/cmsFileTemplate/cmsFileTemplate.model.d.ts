import { BaseModel } from '@coko/server'

declare class CMSFileTemplate extends BaseModel {
  name: string | null
  fileId: string | null
  parentId: string | null
  groupId: string
  rootFolder: boolean
}

export = CMSFileTemplate
