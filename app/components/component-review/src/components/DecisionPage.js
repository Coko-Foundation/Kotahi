import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery, useMutation, gql, useApolloClient } from '@apollo/client'
import { set, debounce } from 'lodash'
import config from 'config'
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

import {
  CREATE_MESSAGE,
  CREATE_TEAM_MUTATION,
  UPDATE_TEAM_MUTATION,
} from '../../../../queries'
import { validateDoi } from '../../../../shared/commsUtils'

const urlFrag = config.journal.metadata.toplevel_urlfragment

export const updateManuscriptMutation = gql`
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

let debouncers = {}

const DecisionPage = ({ match }) => {
  // start of code from submit page to handle possible form changes
  const client = useApolloClient()

  useEffect(() => {
    return () => {
      debouncers = {}
    }
  }, [])

  const handleChange = (value, path, versionId) => {
    const manuscriptDelta = {} // Only the changed fields

    // Takes the $PATH (meta.title) and $VALUE (meta.title) -> { meta: { title: '$VALUE' } }
    // String to Object conversion happens here
    set(manuscriptDelta, path, value)

    debouncers[path] = debouncers[path] || debounce(updateManuscript, 3000)

    return debouncers[path](versionId, manuscriptDelta)
  }

  // end of code from submit page to handle possible form changes

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    fetchPolicy: 'cache-and-network',
  })

  const [update] = useMutation(updateManuscriptMutation)
  const [sendEmailMutation] = useMutation(sendEmail)
  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [updateTeam] = useMutation(UPDATE_TEAM_MUTATION)
  const [createTeam] = useMutation(CREATE_TEAM_MUTATION)
  const [doUpdateReview] = useMutation(updateReviewMutation)
  const [createFile] = useMutation(createFileMutation)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const updateManuscript = (versionId, manuscriptDelta) =>
    update({
      variables: {
        id: versionId,
        input: JSON.stringify(manuscriptDelta),
      },
    })

  const updateReview = async (reviewId, reviewData, manuscriptId) => {
    doUpdateReview({
      variables: { id: reviewId || undefined, input: reviewData },
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

  if (loading && !data) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const {
    manuscript,
    submissionForm,
    decisionForm: decisionFormOuter,
    reviewForm: reviewFormOuter,
    currentUser,
    users,
  } = data

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = decisionFormOuter?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = reviewFormOuter?.structure ?? {
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

  const sendChannelMessageCb = async messageData => {
    const response = await sendChannelMessage({
      variables: messageData,
    })

    return response
  }

  /** This will only send the modified field, not the entire review object */
  const updateReviewJsonData = (versionId, value, path) => {
    const reviewDelta = {} // Only the changed fields
    // E.g. if path is 'meta.title' and value is 'Foo' this gives { meta: { title: 'Foo' } }
    set(reviewDelta, path, value)

    const reviewPayload = {
      isDecision: true,
      jsonData: JSON.stringify(reviewDelta),
      manuscriptId: manuscript.id,
      userId: currentUser.id,
    }

    updateReview(versionId, reviewPayload, manuscript.id)
  }

  return (
    <DecisionVersions
      allUsers={users}
      canHideReviews={config.review.hide === 'true'}
      createFile={createFile}
      createTeam={createTeam}
      currentUser={currentUser}
      decisionForm={decisionForm}
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
      reviewForm={reviewForm}
      sendChannelMessageCb={sendChannelMessageCb}
      sendNotifyEmail={sendNotifyEmail}
      teamLabels={config.teams}
      updateManuscript={updateManuscript}
      updateReview={updateReview}
      updateReviewJsonData={updateReviewJsonData}
      updateTeam={updateTeam}
      urlFrag={urlFrag}
      validateDoi={validateDoi(client)}
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
