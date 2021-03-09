import React from 'react'
import config from 'config'
import { get } from 'lodash'
import { gql, useQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { Select } from '../../../../shared'

const editorOption = user => ({
  label: user.defaultIdentity?.name || user.email || user.username,
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
      email
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
  const team = (manuscript.teams || []).find(t => t.role === teamRole) || {}

  const members = team.members || []
  const value = members.length > 0 ? members[0].user.id : undefined
  const teamName = get(config, `teams.${teamRole}.name`)

  const { data, loading, error } = useQuery(query)

  const [updateTeam] = useMutation(updateTeamMutation)
  const [createTeam] = useMutation(createTeamMutation)

  if (loading || error) {
    return null
  }

  const options = (data.users || []).map(user => editorOption(user))

  const assignRole = async (userId, role) => {
    if (value) {
      const teamToUpdate = manuscript.teams.find(t => t.role === teamRole)
      updateTeam({
        variables: {
          id: teamToUpdate.id,
          input: {
            members: [{ user: { id: userId } }],
          },
        },
      })
    } else {
      const input = {
        // Editors are always linked to the parent manuscript
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

AssignEditor.propTypes = {
  teamRole: PropTypes.string.isRequired,
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default AssignEditor
