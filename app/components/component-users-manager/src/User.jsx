import React from 'react'
import { CheckboxGroup } from '@pubsweet/ui'
import config from 'config'
import gql from 'graphql-tag'
import { graphql } from '@apollo/react-hoc'
import { compose } from 'recompose'

const updateTeamMutation = gql`
  mutation($id: ID, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      id
      role
      name
      members {
        id
        user {
          id
          username
          teams {
            id
            role
          }
        }
      }
    }
  }
`

const createTeamMutation = gql`
  mutation($input: TeamInput) {
    createTeam(input: $input) {
      id
      role
      name
      members {
        id
        user {
          id
          username
          teams {
            id
            role
          }
        }
      }
    }
  }
`

const getTeamsQuery = gql`
  {
    teams {
      id
      role
      members {
        id
        user {
          id
        }
      }
    }
  }
`

const configuredTeams = config.authsome.teams
const teamsCheckboxGroupOptions = Object.entries(configuredTeams).map(
  ([shortName, details]) => ({
    value: shortName,
    label: details.name,
  }),
)

class User extends React.Component {
  findExistingTeam(role) {
    return this.props.getTeamsQuery.teams.find(
      team => team.role === role && team.object === undefined,
    )
  }

  addMember(role) {
    const { user } = this.props
    const existingTeam = this.findExistingTeam(role)

    if (existingTeam) {
      const existingMember = existingTeam.members.find(
        member => member.user.id === user.id,
      )

      if (!existingMember) {
        const members = existingTeam.members.map(m => ({ id: m.id }))
        members.push({ user: { id: user.id } })
        this.updateTeamMutation({
          variables: {
            id: existingTeam.id,
            input: { members },
          },
        })
      }
    } else {
      this.createTeamMutation({
        variables: {
          input: {
            role,
            name: configuredTeams[role].name,
            members: { user: { id: user.id } },
          },
        },
      })
    }
  }

  removeMember(role) {
    const { user } = this.props
    const existingTeam = this.findExistingTeam(role)
    if (!existingTeam) {
      return
    }

    if (existingTeam) {
      const existingMember = existingTeam.members.find(
        member => member.user.id === user.id,
      )
      if (existingMember) {
        const members = existingTeam.members.filter(
          member => member.user.id !== user.id,
        )
        this.updateTeamMutation({
          variables: {
            id: existingTeam.id,
            input: { members: members.map(m => ({ id: m.id })) },
          },
        })
      }
    }
  }

  onTeamChange(roles) {
    // Idempotently add member
    roles.forEach(role => this.addMember(role))

    // Idempotently remove member
    const teamsDifference = Object.keys(configuredTeams).filter(
      role => !roles.includes(role),
    )
    teamsDifference.forEach(role => this.removeMember(role))
  }

  render() {
    this.updateTeamMutation = this.props.updateTeamMutation
    this.createTeamMutation = this.props.createTeamMutation
    this.getTeamsQuery = this.props.getTeamsQuery

    const { user } = this.props

    return (
      <tr className="user">
        <td>{user.id}</td>
        <td>{user.username}</td>
        <td>{user.email}</td>
        <td>{user.admin ? 'yes' : ''}</td>
        <td>
          <CheckboxGroup
            inline
            name="checkboxgroup-inline"
            onChange={value => this.onTeamChange(value)}
            options={teamsCheckboxGroupOptions}
            value={user.teams.map(team => team.role)}
          />
        </td>
      </tr>
    )
  }
}

export default compose(
  graphql(updateTeamMutation, { name: 'updateTeamMutation' }),
  graphql(createTeamMutation, { name: 'createTeamMutation' }),
  graphql(getTeamsQuery, { name: 'getTeamsQuery' }),
)(User)
