import * as api from 'pubsweet-client/src/helpers/api'

// TODO: move teams to journal config
const teamNames = {
  'managing-editor': 'Managing Editor',
  'senior-editor': 'Senior Editor',
  'handling-editor': 'Handling Editor'
}

export const addUserToTeam = ({ teamType, group, project, user }) => dispatch => {
  const team = project._teams.find(team => team.teamType === teamType)

  if (!team) {
    return api.create('/teams', {
      teamType,
      group,
      name: teamNames[teamType],
      object: {
        type: 'collection',
        id: project.id
      },
      members: [user]
    }).then(team => {
      project._teams.push(team)
    })
  }

  team.members.push(user)

  return api.update(`/teams/${team.id}`, team)
}
