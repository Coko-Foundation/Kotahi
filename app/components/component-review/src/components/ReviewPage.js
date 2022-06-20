import React, { useRef, useEffect } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import config from 'config'
import { Redirect } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'
import { set } from 'lodash'
import ReviewLayout from './review/ReviewLayout'
import { Heading, Page, Spinner } from '../../../shared'
import useCurrentUser from '../../../../hooks/useCurrentUser'
import manuscriptVersions from '../../../../shared/manuscript_versions'

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

const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenReviewerName
  canBePublishedPublicly
  user {
    id
    username
    defaultIdentity {
      id
      identifier
    }
  }
`

const fragmentFields = `
  id
  shortId
  created
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      key
      mimetype
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  decision
  teams {
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
      status
      isShared
    }
  }
  status
  meta {
    manuscriptId
    title
    source
    abstract
    declarations {
      openData
      openPeerReview
      preregistered
      previouslySubmitted
      researchNexus
      streamlinedReview
    }
    articleSections
    articleType
    history {
      type
      date
    }
    notes {
      notesType
      content
    }
    keywords
  }
  submission
  suggestions {
    reviewers {
      opposed
      suggested
    }
    editors {
      opposed
      suggested
    }
  }
`

const formStructure = `
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      placeholder
      parse
      format
      options {
        id
        label
        labelColor
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
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

    manuscript(id: $id) {
      parentId
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission") {
      ${formStructure}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review") {
      ${formStructure}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision") {
      ${formStructure}
    }
  }
`

const completeReviewMutation = gql`
  mutation($id: ID!) {
    completeReview(id: $id) {
      id
      status
    }
  }
`

const updateReviewMutationQuery = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

const urlFrag = config.journal.metadata.toplevel_urlfragment

const ReviewPage = ({ match, ...props }) => {
  const currentUser = useCurrentUser()
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [completeReview] = useMutation(completeReviewMutation)
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

  const { loading, error, data, refetch } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    partialRefetch: true,
  })

  const reviewOrInitial = manuscript =>
    manuscript?.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    ) || {}

  const versions = data
    ? manuscriptVersions(data.manuscript).map(v => ({
        ...v.manuscript,
        reviews: v.manuscript.reviews.map(r => ({
          ...r,
          jsonData: JSON.parse(r.jsonData),
        })),
      }))
    : []

  const latestVersion = versions.length ? versions[0] : null

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(latestVersion))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(latestVersion)
  }, [latestVersion?.reviews])

  if (loading) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript } = data

  // We shouldn't arrive at this page with a subsequent/child manuscript ID. If we do, redirect to the parent/original ID
  if (manuscript.parentId)
    return <Redirect to={`${urlFrag}/versions/${manuscript.parentId}/review`} />

  if (
    !latestVersion.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    )
  ) {
    refetch()
  }

  const submissionForm = data.submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = data.reviewForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = data.decisionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const channelId = manuscript.channels.find(c => c.type === 'editorial')?.id
  if (!channelId)
    console.error(
      `Malformed channels in manuscript ${manuscript.id}:`,
      manuscript.channels,
    )

  const { status } =
    (
      (latestVersion.teams.find(team => team.role === 'reviewer') || {})
        .status || []
    ).find(statusTemp => statusTemp.user === currentUser?.id) || {}

  const updateReviewJsonData = (value, path) => {
    const reviewDelta = {} // Only the changed fields
    // E.g. if path is 'foo.bar' and value is 'Baz' this gives { foo: { bar: 'Baz' } }
    set(reviewDelta, path, value)

    const reviewPayload = {
      isDecision: false,
      jsonData: JSON.stringify(reviewDelta),
      manuscriptId: latestVersion.id,
      userId: currentUser.id,
    }

    return updateReviewMutation({
      variables: { id: existingReview.current.id, input: reviewPayload },
      update: (cache, { data: { updateReview: updateReviewTemp } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: latestVersion.id,
          }),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updateReviewTemp,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updateReviewTemp.id,
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

  const updateReview = review => {
    const reviewData = {
      manuscriptId: latestVersion.id,
      canBePublishedPublicly: review.canBePublishedPublicly,
      jsonData: JSON.stringify(review.jsonData),
    }

    return updateReviewMutation({
      variables: {
        id: existingReview.current.id || undefined,
        input: reviewData,
      },
      update: (cache, { data: { updateReviewTemp } }) => {
        cache.modify({
          id: cache.identify(latestVersion.id),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updateReviewTemp,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updateReviewTemp.id,
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

  const handleSubmit = async ({ reviewId, history }) => {
    await completeReview({
      variables: {
        id: reviewId,
      },
    })

    history.push(`${urlFrag}/dashboard`)
  }

  return (
    <ReviewLayout
      channelId={channelId}
      createFile={createFile}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      onSubmit={values =>
        handleSubmit({
          reviewId: existingReview.current.id,
          history: props.history,
        })
      }
      review={existingReview}
      reviewForm={reviewForm}
      status={status}
      submissionForm={submissionForm}
      updateReview={updateReview}
      updateReviewJsonData={updateReviewJsonData}
      versions={versions}
    />
  )
}

ReviewPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default ReviewPage
