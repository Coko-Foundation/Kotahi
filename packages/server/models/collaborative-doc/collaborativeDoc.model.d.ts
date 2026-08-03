import { BaseModel } from '@coko/server'

declare class CollaborativeDoc extends BaseModel {
  objectId: string
  objectType: string
  groupId: string
  yDocState: Uint8Array

  readDocState(objName: string, objType: string): unknown
}

export = CollaborativeDoc
