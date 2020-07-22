import React from 'react'
import moment from 'moment'

import { Tabs } from '@pubsweet/ui'
import { Formik } from 'formik'
import { useMutation, useQuery, gql } from '@apollo/client'
import DecisionForm from './decision/DecisionForm'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import ReviewMetadata from './metadata/ReviewMetadata'
import Decision from './decision/Decision'
// import EditorSection from './EditorSection'
import { AdminSection, Columns, Manuscript, Chat, TabsContainer } from './style'

// const addEditor = (manuscript, label) => ({
//   content: <EditorSection manuscript={manuscript} />,
//   key: manuscript.id,
//   label,
// })

import { Spinner } from '../../../shared'

import { getCommentContent } from './review/util'
import MessageContainer from '../../../component-chat/src'

const reviewFields = `
  id
  created
  updated
  comments {
    type
    content
    files {
      id
      created
      label
      filename
      fileType
      mimeType
      size
      url
    }
  }
  isDecision
  recommendation
  user {
    id
    username
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
    fileType
    mimeType
    size
    url
  }
  reviews {
    ${reviewFields}
  }
  decision
  teams {
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
      status
    }
  }
  status
  meta {
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

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
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
  }
`

const updateReviewMutationQuery = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

const uploadReviewFilesMutation = gql`
  mutation($file: Upload!) {
    upload(file: $file) {
      url
    }
  }
`

const createFileMutation = gql`
  mutation($file: Upload!) {
    createFile(file: $file) {
      id
      created
      label
      filename
      fileType
      mimeType
      size
      url
    }
  }
`

const makeDecisionMutation = gql`
  mutation($id: ID!, $decision: String) {
    makeDecision(id: $id, decision: $decision) {
      id
      ${fragmentFields}
    }
  }
`

const updateCacheForFileCreation = (proxy, { data: { createFile } }) => {
  const data = proxy.readQuery({
    query,
    variables: {
      id: match.params.version,
    },
  })

  data.manuscript.reviews.map(review => {
    if (review.id === file.objectId) {
      review.comments.map(comment => {
        if (comment.type === createFile.fileType) {
          comment.files = [createFile]
        }
        return comment
      })
    }
    return review
  })

  proxy.writeQuery({ query, data })
}

// const createFile = file => {

//   mutate({
//     variables: {
//       file,
//     },
//     update:
// },

//

const dateLabel = date => moment(date).format('YYYY-MM-DD')

const decisionSections = ({
  manuscript,
  handleSubmit,
  isValid,
  updateReview,
  uploadFile,
}) => {
  const decisionSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []
  manuscriptVersions.forEach(manuscript => {
    decisionSections.push({
      content: (
        <>
          <ReviewMetadata manuscript={manuscript} />
          <DecisionReviews manuscript={manuscript} />
          <Decision
            review={manuscript.reviews.find(review => review.isDecision)}
          />
        </>
      ),
      key: manuscript.id,
      label: dateLabel(manuscript.updated),
    })
  }, [])

  if (manuscript.status !== 'revising') {
    decisionSections.push({
      content: (
        <>
          <AdminSection key="assign-editors">
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={manuscript}
            />
          </AdminSection>
          <AdminSection key="review-metadata">
            <ReviewMetadata manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-review">
            <DecisionReviews manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-form">
            <DecisionForm
              handleSubmit={handleSubmit}
              isValid={isValid}
              updateReview={updateReview}
              uploadFile={uploadFile}
            />
          </AdminSection>
        </>
      ),
      key: manuscript.id,
      label: dateLabel(),
    })
  }

  return decisionSections
}

const editorSections = ({ manuscript }) => {
  const editorSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []
  manuscriptVersions.forEach(manuscript => {
    editorSections.push(addEditor(manuscript, dateLabel(manuscript.updated)))
  }, [])

  if (manuscript.status !== 'revising') {
    editorSections.push(addEditor(manuscript, dateLabel()))
  }
}

const DecisionPage = ({ match }) => {
  // Hooks from the old world
  const [makeDecision] = useMutation(makeDecisionMutation, {
    refetchQueries: [query],
  })
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)

  // File upload
  const [uploadReviewFiles] = useMutation(uploadReviewFilesMutation)

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const manuscript = data.manuscript

  // Protect if channels don't exist for whatever reason
  let channelId
  if (Array.isArray(manuscript.channels) && manuscript.channels.length) {
    channelId = manuscript.channels.find(c => c.type === 'editorial').id
  }

  const uploadFile = (file, updateReview, type) =>
    uploadReviewFiles({
      variables: {
        file,
      },
    }).then(({ data }) => {
      const newFile = {
        url: data.upload.url,
        filename: file.name,
        size: file.size,
        object: 'Review',
        objectId: updateReview.id,
        fileType: type,
      }
      createFile(newFile)
    })

  const updateReview = (data, file) => {
    const reviewData = {
      isDecision: true,
      manuscriptId: manuscript.id,
    }

    if (data.comment) {
      reviewData.comments = [data.comment]
    }

    if (data.recommendation) {
      reviewData.recommendation = data.recommendation
    }

    const review = manuscript.reviews.find(review => review.isDecision) || {}
    return updateReviewMutation({
      variables: {
        id: review.id || undefined,
        input: reviewData,
      },
      update: (proxy, { data: { updateReview } }) => {
        const data = proxy.readQuery({
          query,
          variables: {
            id: manuscript.id,
          },
        })
        const reviewIndex = data.manuscript.reviews.findIndex(
          review => review.id === updateReview.id,
        )
        if (reviewIndex < 0) {
          data.manuscript.reviews.push(updateReview)
        } else {
          data.manuscript.reviews[reviewIndex] = updateReview
        }
        proxy.writeQuery({ query, data })
      },
    })
  }
  // },
  //   }).then(() => {
  //     history.push('/dashboard')
  //   })
  // }

  //

  // console.log(props)

  const initialValues = (manuscript.reviews &&
    manuscript.reviews.find(review => review.isDecision)) || {
    comments: [],
    recommendation: null,
  }

  return (
    <Columns>
      <Manuscript>
        <Formik
          displayName="decision"
          initialValues={initialValues}
          // isInitialValid={({ manuscript }) => {
          //   const rv =
          //     manuscript.reviews.find(review => review.isDecision) || {}
          //   const isRecommendation = rv.recommendation != null
          //   const isCommented = getCommentContent(rv, 'note') !== ''

          //   return isCommented && isRecommendation
          // }}
          onSubmit={() => {
            makeDecision({
              variables: {
                id: manuscript.id,
                decision: manuscript.reviews.find(review => review.isDecision)
                  .recommendation,
              },
            })
          }}
          validate={(values, props) => {
            const errors = {}
            if (getCommentContent(values, 'note') === '') {
              errors.comments = 'Required'
            }

            if (values.recommendation === null) {
              errors.recommendation = 'Required'
            }
            return errors
          }}
        >
          {props => (
            // Temp
            /* <Tabs
              activeKey={editorSections[editorSections.length - 1].key}
              sections={editorSections}
              title="Versions"
            /> */
            <Tabs
              activeKey={
                decisionSections({
                  manuscript,
                  handleSubmit: props.handleSubmit,
                  isValid: props.isValid,
                  updateReview,
                  uploadFile,
                })[decisionSections.length - 1].key
              }
              sections={decisionSections({
                manuscript,
                handleSubmit: props.handleSubmit,
                isValid: props.isValid,
                updateReview,
                uploadFile,
              })}
              title="Versions"
            />
          )}
        </Formik>
      </Manuscript>

      <Chat>{channelId && <MessageContainer channelId={channelId} />}</Chat>
    </Columns>
  )
}

export default DecisionPage
