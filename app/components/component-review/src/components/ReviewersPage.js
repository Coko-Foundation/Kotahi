import React from 'react'
import { Formik } from 'formik'
import { gql, useQuery, useMutation } from '@apollo/client'
import Reviewers from '../components/reviewers/Reviewers'
import ReviewerContainer from '../components/reviewers/ReviewerContainer'
import { Spinner } from '../../../shared'

const teamFields = `
  id
  role
  name
  manuscript {
    id
  }
  members {
    id
    user {
      id
      username
      profilePicture
      online
      defaultIdentity {
        id
        name
      }
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

const addReviewerMutation = gql`
  mutation($manuscriptId: ID!, $userId: ID!) {
    addReviewer(manuscriptId: $manuscriptId, userId: $userId) {
      ${teamFields}
    }
  }
`

const removeReviewerMutation = gql`
  mutation($manuscriptId: ID!, $userId: ID!) {
    removeReviewer(manuscriptId: $manuscriptId, userId: $userId) {
      ${teamFields}
    }
  }
`

const query = gql`
  query($id: ID!) {
    users {
      id
      username
      profilePicture
      online
      admin
      defaultIdentity {
        id
        name
      }
    }

    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const ReviewersPage = ({ match, history }) => {
  const { data, error, loading } = useQuery(query, {
    variables: { id: match.params.version },
  })

  const [addReviewer] = useMutation(addReviewerMutation, {
    update: (cache, { data: { addReviewer } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: addReviewer.manuscript.id,
        }),
        fields: {
          teams(existingTeamRefs = []) {
            const newTeamRef = cache.writeFragment({
              data: addReviewer,
              fragment: gql`
                fragment NewTeam on Team {
                  id
                  role
                  members {
                    id
                    user {
                      id
                    }
                  }
                }
              `,
            })

            return [...existingTeamRefs, newTeamRef]
          },
        },
      })
    },
  })
  const [removeReviewer] = useMutation(removeReviewerMutation)

  if (loading) {
    return <Spinner />
  }
  if (error) return error

  const { manuscript, users } = data
  const reviewersTeam =
    manuscript.teams.find(team => team.role === 'reviewer') || {}

  const reviewers = reviewersTeam.members || []
  return (
    <Formik
      displayName="reviewers"
      initialValues={{ user: undefined }}
      onSubmit={values =>
        addReviewer({
          variables: { userId: values.user.id, manuscriptId: manuscript.id },
        })
      }
    >
      {props => (
        <Reviewers
          {...props}
          history={history}
          manuscript={manuscript}
          removeReviewer={removeReviewer}
          Reviewer={ReviewerContainer}
          reviewers={reviewers}
          reviewerUsers={users}
        />
      )}
    </Formik>
  )
}

export default ReviewersPage
