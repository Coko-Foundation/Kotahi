import React from 'react'
import config from 'config'
import { compose, withProps } from 'recompose'
import { cloneDeep, get } from 'lodash'
import { graphql } from '@apollo/client/react/hoc'
import gql from 'graphql-tag'
import { withLoader } from 'pubsweet-client'
import { Select } from '../../../../shared'

const editorOption = user => ({
  label: user.defaultIdentity.name,
  value: user.id,
})

const teamFields = `
  id
  name
  role
  object {
    objectId
    objectType
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

const updateTeam = gql`
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

// TODO: select multiple editors
const AssignEditor = ({
  updateTeam,
  createTeam,
  teamName,
  teamRole,
  value,
  options,
}) => (
  <Select
    aria-label={`Assign ${teamRole}`}
    data-testid={`assign${teamRole}`}
    label={teamName}
    onChange={selected => {
      // selected is { label, value } object
      if (value) {
        updateTeam(selected.value, teamRole)
      } else {
        createTeam(selected.value, teamRole)
      }
    }}
    options={options}
    placeholder={`Assign ${teamName}…`}
    value={value}
  />
)

export default compose(
  graphql(query),
  graphql(updateTeam, {
    props: ({ mutate, ownProps }) => {
      const updateTeam = (userId, teamRole) => {
        const team = cloneDeep(ownProps.manuscript.teams).find(
          team => team.role === teamRole,
        )
        mutate({
          variables: {
            id: team.id,
            input: {
              members: [{ user: { id: userId } }],
            },
          },
        })
      }

      return {
        updateTeam,
      }
    },
  }),
  graphql(createTeamMutation, {
    props: ({ mutate, ownProps }) => {
      const createTeam = (userId, teamRole) => {
        const input = {
          objectId: ownProps.manuscript.id,
          objectType: 'Manuscript',
          name:
            teamRole === 'seniorEditor' ? 'Senior Editor' : 'Handling Editor',
          role: teamRole,
          members: [{ user: { id: userId } }],
        }

        mutate({
          variables: {
            input,
          },
        })
      }

      return {
        createTeam,
      }
    },
  }),
  withProps(({ teamRole, manuscript, data = {} }) => {
    const optionUsers = (data.users || []).map(user => editorOption(user))

    const team =
      (manuscript.teams || []).find(team => team.role === teamRole) || {}

    const members = team.members || []
    const teamName = get(config, `authsome.teams.${teamRole}.name`)
    return {
      teamName,
      options: optionUsers,
      value: members.length > 0 ? members[0].user.id : undefined,
    }
  }),
  withLoader(),
)(AssignEditor)
