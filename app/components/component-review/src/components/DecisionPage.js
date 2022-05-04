import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client'
import { set, debounce } from 'lodash'
import config from 'config'
// eslint-disable-next-line no-unused-vars
import { id } from 'inversify'
import DecisionVersions from './DecisionVersions'
import { Spinner, CommsErrorBanner } from '../../../shared'
import { fragmentFields } from '../../../component-submit/src/userManuscriptFormQuery'

import {
  query,
  sendEmail,
  makeDecisionMutation,
  updateReviewMutation,
  publishManuscriptMutation,
} from './queries'

import { CREATE_MESSAGE } from '../../../../queries'

const urlFrag = config.journal.metadata.toplevel_urlfragment

export const updateMutation = gql`
  mutation($id: ID!, $input: String) {
    updateManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

const deleteFileMutation = gql`
  mutation($id: ID!) {
    deleteFile(id: $id)
  }
`

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

let debouncers = {}

const DecisionPage = ({ match }) => {
  // start of code from submit page to handle possible form changes
  const client = useApolloClient()

  const [confirming, setConfirming] = useState(false)

  const toggleConfirming = () => {
    setConfirming(confirm => !confirm)
  }

  useEffect(() => {
    return () => {
      debouncers = {}
    }
  }, [])

  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields
    set(manuscriptDelta, path, value)
    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)
    return debouncers[path](versionId, manuscriptDelta)
  }

  // end of code from submit page to handle possible form changes

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    fetchPolicy: 'network-only', // TODO This prevents reviews sometimes having a null user. The whole graphql/caching in DecisionPage and DecisionVersion needs clean-up.
  })

  const [update] = useMutation(updateMutation)
  const [sendEmailMutation] = useMutation(sendEmail)
  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [updateTeam] = useMutation(updateTeamMutation)
  const [createTeam] = useMutation(createTeamMutation)
  const [doUpdateReview] = useMutation(updateReviewMutation)
  const [createFile] = useMutation(createFileMutation)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      // eslint-disable-next-line no-shadow
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const updateManuscript = (versionId, manuscriptDelta) => {
    return update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })
  }

  const updateReview = async (reviewId, reviewData, manuscriptId) => {
    return doUpdateReview({
      variables: { id: reviewId || undefined, input: reviewData },
      optimisticResponse: {
        __typename: 'Mutation',
        updateReview: {
          id: 'reviewId',
          __typename: 'review',
          input: reviewData,
        },
      },
      update: (cache, { data: { updateReview: updatedReview } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: manuscriptId,
          }),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updatedReview,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updatedReview.id,
                )
              ) {
                return existingReviewRefs
              }

              return [...existingReviewRefs, newReviewRef]
            },
          },
        })
      },
    })
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { manuscript, formForPurposeAndCategory, currentUser, users } = data

  const form = formForPurposeAndCategory?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const sendNotifyEmail = async emailData => {
    const response = await sendEmailMutation({
      variables: {
        input: JSON.stringify(emailData),
      },
    })

    return response
  }

  const sendChannelMessageCb = async messageData =>
    sendChannelMessage(messageData)

  return (
    <DecisionVersions
      allUsers={users}
      canHideReviews={config.review.hide === 'true'}
      client={client}
      confirming={confirming}
      createFile={createFile}
      createTeam={createTeam}
      currentUser={currentUser}
      deleteFile={deleteFile}
      displayShortIdAsIdentifier={
        config['client-features'].displayShortIdAsIdentifier &&
        config['client-features'].displayShortIdAsIdentifier.toLowerCase() ===
          'true'
      }
      form={form}
      handleChange={handleChange}
      makeDecision={makeDecision}
      manuscript={manuscript}
      publishManuscript={publishManuscript}
      reviewers={data?.manuscript?.reviews}
      sendChannelMessageCb={sendChannelMessageCb}
      sendNotifyEmail={sendNotifyEmail}
      teamLabels={config.teams}
      toggleConfirming={toggleConfirming}
      updateManuscript={updateManuscript}
      updateReview={updateReview}
      updateTeam={updateTeam}
      urlFrag={urlFrag}
    />
  )
}

DecisionPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      version: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default DecisionPage
