import { compose } from 'recompose'
import { omit } from 'lodash'
import config from 'config'
import { graphql } from '@apollo/react-hoc'
import { gql } from 'apollo-client-preset'

import queries from './graphql/queries'
import TeamsManager from './TeamsManager'

const deleteTeamMutation = gql`
  mutation($id: ID) {
    deleteTeam(id: $id) {
      id
      type
      role
      name
      object {
        objectId
        objectType
      }
      members {
        user {
          id
          username
        }
      }
    }
  }
`

const createTeamMutation = gql`
  mutation($input: TeamInput!) {
    createTeam(input: $input) {
      id
      type
      role
      name
      object {
        objectId
        objectType
      }
      members {
        user {
          id
          username
        }
      }
    }
  }
`

const updateTeamMutation = gql`
  mutation($id: ID, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      id
      type
      role
      name
      object {
        objectId
        objectType
      }
      members {
        user {
          id
          username
        }
      }
    }
  }
`

export default compose(
  graphql(queries.teamManager, {
    props: ({ data }) => {
      const userOptions = ((data || {}).users || []).map(user => ({
        value: user.id,
        label: user.username,
      }))

      const manuscriptsOptions = ((data || {}).manuscripts || []).map(manu => ({
        value: manu.id,
        label: manu.meta.title,
      }))

      const types = config.authsome.teams
      const typesOptions = Object.keys(types).map(type => ({
        value: type,
        label: `${types[type].name} ${types[type].permissions}`,
      }))
      return {
        teams: (data || {}).teams,
        manuscriptsOptions,
        userOptions,
        typesOptions,
      }
    },
  }),
  graphql(updateTeamMutation, {
    props: ({ mutate }) => {
      const updateTeam = (members, team) => {
        let input = {
          ...team,
          objectId: team.object.objectId,
          objectType: team.object.objectType,
          object: undefined,
        }

        input.members = members.map(m => ({ user: { id: m } }))
        input = omit(input, ['id', 'object.__typename', '__typename'])

        mutate({
          variables: {
            id: team.id,
            input,
          },
        })
      }

      return {
        updateTeam,
      }
    },
  }),
  graphql(deleteTeamMutation, {
    props: ({ mutate }) => {
      const deleteTeam = data => {
        mutate({
          variables: {
            id: data.id,
          },
        })
      }

      return {
        deleteTeam,
      }
    },
    options: {
      update: (proxy, { data: { deleteTeam } }) => {
        const data = proxy.readQuery({ query: queries.teamManager })
        const teamsIndex = data.teams.findIndex(
          team => team.id === deleteTeam.id,
        )
        if (teamsIndex > -1) {
          data.teams.splice(teamsIndex, 1)
          proxy.writeQuery({ query: queries.teamManager, data })
        }
      },
    },
  }),
  graphql(createTeamMutation, {
    props: ({ mutate }) => {
      const createTeam = input => {
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
    options: {
      update: (proxy, { data: { createTeam } }) => {
        const data = proxy.readQuery({ query: queries.teamManager })
        data.teams.push(createTeam)
        proxy.writeQuery({ query: queries.teamManager, data })
      },
    },
  }),
)(TeamsManager)
