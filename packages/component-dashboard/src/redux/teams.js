import actions from 'pubsweet-client/src/actions'

export const addUserToTeam = ({ team, teamTypeName, name, group, project, user }) => dispatch => {
  if (team) {
    team.members.push(user)
    return dispatch(actions.updateTeam(team))
  }

  return dispatch(actions.createTeam({
    teamType: {
      name: teamTypeName,
      permissions: 'editor' // TODO
    },
    group,
    name,
    object: {
      type: 'collection',
      id: project.id
    },
    members: [user]
  }))
}
