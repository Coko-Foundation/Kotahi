import React from 'react'
import config from 'config'
import { get } from 'lodash'
import { useQuery, useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { Select } from '../../../../shared'

const editorOption = user => ({
  label: user.defaultIdentity.name,
  value: user.id,
})

const teamFields = `
  id
  name
  role
  manuscript {
    id
  }
  members {
    id
    user {
      id
      username
    }
  }
`

const query = gql`
  {
    users {
      id
      username
      admin
      defaultIdentity {
        id
        name
      }
    }
  }
`

const updateTeamMutation = gql`
  mutation($id: ID!, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      ${teamFields}
    }
  }
`

const createTeamMutation = gql`
  mutation($input: TeamInput!) {
    createTeam(input: $input) {
      ${teamFields}
    }
  }
`

const AssignEditor = ({ teamRole, manuscript }) => {
  const team =
    (manuscript.teams || []).find(team => team.role === teamRole) || {}

  const members = team.members || []
  const value = members.length > 0 ? members[0].user.id : undefined
  const teamName = get(config, `authsome.teams.${teamRole}.name`)

  const { data, loading, error } = useQuery(query)

  const [updateTeam] = useMutation(updateTeamMutation)
  const [createTeam] = useMutation(createTeamMutation)

  if (loading || error) {
    return null
  }

  const options = (data.users || []).map(user => editorOption(user))

  const assignRole = async (userId, role) => {
    if (value) {
      const team = manuscript.teams.find(team => team.role === teamRole)
      updateTeam({
        variables: {
          id: team.id,
          input: {
            members: [{ user: { id: userId } }],
          },
        },
      })
    } else {
      const input = {
        manuscriptId: manuscript.id,
        name: teamRole === 'seniorEditor' ? 'Senior Editor' : 'Handling Editor',
        role: teamRole,
        members: [{ user: { id: userId } }],
      }

      createTeam({
        variables: {
          input,
        },
      })
    }
  }

  return (
    <Select
      aria-label={`Assign ${teamRole}`}
      data-testid={`assign${teamRole}`}
      label={teamName}
      onChange={selected => assignRole(selected.value, teamRole)}
      options={options}
      placeholder={`Assign ${teamName}…`}
      value={value}
    />
  )
}

export default AssignEditor
// export default compose(
// graphql(query),
// graphql(updateTeam, {
//   props: ({ mutate, ownProps }) => {
//     const updateTeam = (userId, teamRole) => {}

//     return {
//       updateTeam,
//     }
//   },
// }),
// graphql(createTeamMutation, {
//   props: ({ mutate, ownProps }) => {
//     const createTeam = (userId, teamRole) => {
//       const input = {
//         manuscriptId: ownProps.manuscript.id,
//         name:
//           teamRole === 'seniorEditor' ? 'Senior Editor' : 'Handling Editor',
//         role: teamRole,
//         members: [{ user: { id: userId } }],
//       }

//       mutate({
//         variables: {
//           input,
//         },
//       })
//     }

//     return {
//       createTeam,
//     }
//   },
// }),

// withLoader(),
// )(AssignEditor)
