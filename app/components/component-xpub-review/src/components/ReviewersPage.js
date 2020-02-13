import { compose, withProps } from 'recompose'
import { withFormik } from 'formik'
import { graphql } from '@apollo/react-hoc'
import { gql } from 'apollo-client-preset'
import { withLoader } from 'pubsweet-client'
import { omit } from 'lodash'

import Reviewers from '../components/reviewers/Reviewers'
import ReviewerContainer from '../components/reviewers/ReviewerContainer'

const teamFields = `
  id
  role
  name
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
    status
  }
`

const fragmentFields = `
  id
  created
  files {
    id
    created
    label
    filename
    mimeType
    fileType
    size
    url
  }
  reviews {
    open
    recommendation
    created
    comments {
      type
      content
      files {
        fileType
        id
        label
        url
        filename
      }
    }
    user {
      id
      username
    }
  }
  decision
  teams {
    ${teamFields}
  }
  status
`

const createTeamMutation = gql`
  mutation($input: TeamInput!) {
    createTeam(input: $input) {
      ${teamFields}
    }
  }
`

const updateTeamMutation = gql`
  mutation($id: ID, $input: TeamInput) {
    updateTeam(id: $id, input: $input) {
      ${teamFields}
    }
  }
`

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    users {
      id
      username
      admin
    }

    teams {
      ${teamFields}
    }

    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const update = match => (proxy, { data: { updateTeam, createTeam } }) => {
  const data = JSON.parse(
    JSON.stringify(
      proxy.readQuery({
        query,
        variables: {
          id: match.params.version,
        },
      }),
    ),
  )

  if (updateTeam) {
    const teamIndex = data.teams.findIndex(team => team.id === updateTeam.id)
    const manuscriptTeamIndex = data.manuscript.teams.findIndex(
      team => team.id === updateTeam.id,
    )
    data.teams[teamIndex] = updateTeam
    data.manuscript.teams[manuscriptTeamIndex] = updateTeam
  }

  if (createTeam) {
    data.teams.push(createTeam)
    data.manuscript.teams.push(createTeam)
  }
  proxy.writeQuery({ query, data })
}

const handleSubmit = (
  { user },
  { props: { manuscript, updateTeamMutation, createTeamMutation, match } },
) => {
  const team =
    manuscript.teams.find(team => team.role === 'reviewerEditor') || {}

  const teamAdd = {
    objectId: manuscript.id,
    objectType: 'Manuscript',
    // status: [{ user: user.id, status: 'invited' }],
    name: 'Reviewer Editor',
    role: 'reviewerEditor',
    members: [{ user: { id: user.id }, status: 'invited' }],
  }
  if (team.id) {
    const newTeam = {
      ...omit(team, ['object', 'id', '__typename']),
      // TODO: Find a cleaner way of updating members
      members: team.members.map(member => ({
        user: {
          id: member.user.id,
        },
        status: member.status,
      })),
    }

    newTeam.members.push({ user: { id: user.id }, status: 'invited' })
    // newTeam.status.push({ user: user.id, status: 'invited' })
    updateTeamMutation({
      variables: {
        id: team.id,
        input: newTeam,
      },
      update: update(match),
    })
  } else {
    createTeamMutation({
      variables: {
        input: teamAdd,
      },
      update: update(match),
    })
  }
}

export default compose(
  graphql(query, {
    options: ({ match }) => ({
      variables: {
        id: match.params.version,
      },
    }),
  }),
  graphql(createTeamMutation, { name: 'createTeamMutation' }),
  graphql(updateTeamMutation, { name: 'updateTeamMutation' }),
  withLoader(),
  withProps(
    ({
      manuscript,
      teams = [],
      users,
      match: {
        params: { journal },
      },
    }) => {
      const reviewersTeam =
        teams.find(
          team =>
            team.role === 'reviewerEditor' &&
            team.object.objectId === manuscript.id &&
            team.object.objectType === 'Manuscript',
        ) || {}

      return {
        reviewers: reviewersTeam.members || [],
        journal: { id: journal },
        reviewerUsers: users,
        Reviewer: ReviewerContainer,
      }
    },
  ),
  // withHandlers({
  //   loadOptions: props => props.reviewerUsers, // loadOptions(props),
  // }),
  withFormik({
    mapPropsToValues: () => ({ user: '' }),
    displayName: 'reviewers',
    handleSubmit,
  }),
)(Reviewers)
