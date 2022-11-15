import React from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { gql, useQuery, useMutation } from '@apollo/client'
import Reviewers from './reviewers/Reviewers'
import { Spinner, CommsErrorBanner } from '../../../shared'
import {
  GET_EMAIL_INVITED_REVIEWERS,
  UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION,
} from '../../../../queries'

const teamFields = `
  id
  role
  name
  objectId
  objectType
  members {
    id
    user {
      id
      username
      profilePicture
      isOnline
      defaultIdentity {
        id
        identifier
      }
    }
    status
    isShared
  }
`

const fragmentFields = `
  id
  created
  files {
    id
    created
    tags
    storedObjects {
      key
      mimetype
      url
    }
    objectId
  }
  reviews {
    open
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
      isOnline
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

const updateTeamMemberMutation = gql`
  mutation($id: ID!, $input: String) {
    updateTeamMember(id: $id, input: $input) {
      id
      user {
        id
        username
        profilePicture
        isOnline
      }
      status
      isShared
    }
  }
`

const ReviewersPage = ({ match, history }) => {
  const { data, error, loading, refetch } = useQuery(query, {
    variables: { id: match.params.version },
  })

  const [addReviewer] = useMutation(addReviewerMutation, {
    update: (cache, { data: { addReviewer: revisedReviewersObject } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'Manuscript',
          id: revisedReviewersObject.objectId,
        }),
        fields: {
          teams(existingTeamRefs = []) {
            const newTeamRef = cache.writeFragment({
              data: revisedReviewersObject,
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
  const [updateTeamMember] = useMutation(updateTeamMemberMutation)

  const [updateSharedStatusForInvitedReviewer] = useMutation(
    UPDATE_SHARED_STATUS_FOR_INVITED_REVIEWER_MUTATION,
  )

  const { data: emailInvitedReviewers } = useQuery(
    GET_EMAIL_INVITED_REVIEWERS,
    {
      variables: { manuscriptId: match.params.version },
    },
  )

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

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
          variables: {
            userId: values.user.id,
            manuscriptId: manuscript.id,
            status: 'invited',
          },
        })
      }
    >
      {props => (
        <Reviewers
          {...props}
          emailInvitedReviewers={
            emailInvitedReviewers?.getEmailInvitedReviewers
          }
          history={history}
          manuscript={manuscript}
          refetchManuscriptData={refetch}
          removeReviewer={removeReviewer}
          reviewers={reviewers}
          reviewerUsers={users}
          updateSharedStatusForInvitedReviewer={
            updateSharedStatusForInvitedReviewer
          }
          updateTeamMember={updateTeamMember}
        />
      )}
    </Formik>
  )
}

ReviewersPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      version: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
}

export default ReviewersPage
