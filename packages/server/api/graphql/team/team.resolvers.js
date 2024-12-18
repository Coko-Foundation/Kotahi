const {
  createTeam,
  updateTeam,
  updateTeamMember,
  updateCollaborativeTeamMembers,
  userTeams,
} = require('../../../controllers/team.controllers')

const createTeamResolver = async (_, { input }, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return createTeam(input, groupId)
}

const updateTeamResolver = async (_, { id, input }, ctx) => {
  const groupId = ctx.req.headers['group-id']
  return updateTeam(id, input, groupId)
}

const updateTeamMemberResolver = async (_, { id, input }) => {
  return updateTeamMember(id, input)
}

const updateCollaborativeTeamMembersResolver = async (
  _,
  { manuscriptId, input },
) => {
  return updateCollaborativeTeamMembers(manuscriptId, input)
}

const userTeamsResolver = async user => {
  return userTeams(user.id)
}

module.exports = {
  Mutation: {
    createTeam: createTeamResolver,
    updateTeam: updateTeamResolver,
    updateTeamMember: updateTeamMemberResolver,
    updateCollaborativeTeamMembers: updateCollaborativeTeamMembersResolver,
  },
  User: {
    teams: userTeamsResolver,
  },
}
