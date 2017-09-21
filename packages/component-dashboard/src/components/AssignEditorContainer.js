import { connect } from 'react-redux'
import { compose } from 'recompose'
import AssignEditor from './AssignEditor'
import { addUserToTeam } from '../redux/teams'

const editorOption = user => ({
  value: user.id,
  label: user.username // TODO: name
})

export default compose(
  connect(
    (state, { project, teamTypeName }) => ({
      team: state.teams && state.teams
        .find(team => team.object.type === 'collection'
          && team.object.id === project.id
          && team.teamType.name === teamTypeName),
      options: state.users && !state.users.isFetching && state.users.users
      // .filter(user => user.roles.includes(teamType)) // TODO
        .map(editorOption)
    }),
    {
      addUserToTeam
    }
  )
)(AssignEditor)
