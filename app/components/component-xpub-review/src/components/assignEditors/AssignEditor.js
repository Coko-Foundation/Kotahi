import React from 'react'
import config from 'config'
import { compose, withProps } from 'recompose'
import { cloneDeep, get } from 'lodash'
import { Menu } from '@pubsweet/ui'
import { graphql } from '@apollo/react-hoc'
import { gql } from 'apollo-client-preset'
import { withLoader } from 'pubsweet-client'

const editorOption = user => ({
  label: user.username, // TODO: name
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
  <Menu
    data-testid={`assign${teamRole}`}
    label={teamName}
    onChange={user => {
      if (value) {
        updateTeam(user, teamRole)
      } else {
        createTeam(user, teamRole)
      }
    }}
    options={options}
    placeholder="Assign an editor…"
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
