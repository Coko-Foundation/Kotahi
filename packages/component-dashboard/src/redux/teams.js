import actions from 'pubsweet-client/src/actions'

export const addUserToTeam = ({ team, teamType, name, group, project, user }) => dispatch => {
  if (team) {
    team.members.push(user)
    return dispatch(actions.updateTeam(team))
  }

  return dispatch(actions.createTeam({
    teamType,
    group,
    name,
    object: {
      type: 'collection',
      id: project.id
    },
    members: [user]
  }))
}
