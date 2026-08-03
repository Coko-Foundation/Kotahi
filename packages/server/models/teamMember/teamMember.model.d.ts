import { TeamMember as TeamMemberBase } from '@coko/server'

declare class TeamMember extends TeamMemberBase {
  isShared: boolean | null
}

export = TeamMember
