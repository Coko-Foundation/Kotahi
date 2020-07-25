import React from 'react'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { Formik } from 'formik'
import { cloneDeep } from 'lodash'
import { getCommentContent } from './review/util'
import ReviewLayout from '../components/review/ReviewLayout'
import { Spinner } from '../../../shared'
import useCurrentUser from '../../../../hooks/useCurrentUser'

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

export default ({ match, ...props }) => {
  const currentUser = useCurrentUser()
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [completeReview] = useMutation(completeReviewMutation)

  // File upload
  // const [uploadReviewFiles] = useMutation(uploadReviewFilesMutation)

  const [createFileM] = useMutation(createFileMutation)
  const createFile = file =>
    createFileM({
      variables: {
        file,
      },
      update: (proxy, { data: { createFile } }) => {
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
      },
    })

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscript } = data
  const channelId = manuscript.channels.find(c => c.type === 'editorial').id

  const review =
    (manuscript.reviews &&
      manuscript.reviews.find(
        review => review.user.id === currentUser.id && !review.isDecision,
      )) ||
    {}

  // eslint-disable-next-line
  const status = (
    (
      (manuscript.teams.find(team => team.role === 'reviewer') || {}).status ||
      []
    ).find(status => status.user === currentUser.id) || {}
  ).status

  const updateReview = (review, file) => {
    ;(review.comments || []).map(comment => {
      delete comment.files
      delete comment.__typename
      return comment
    })

    const reviewData = {
      recommendation: review.recommendation,
      comments: review.comments,
      manuscriptId: manuscript.id,
    }

    return updateReviewMutation({
      variables: {
        id: review.id || undefined,
        input: reviewData,
      },
      // update: (proxy, { data: { updateReview } }) => {
      //   const data = JSON.parse(
      //     JSON.stringify(
      //       proxy.readQuery({
      //         query,
      //         variables: {
      //           id: manuscript.id,
      //         },
      //       }),
      //     ),
      //   )
      //   let reviewIndex = data.manuscript.reviews.findIndex(
      //     review => review.id === updateReview.id,
      //   )
      //   reviewIndex = reviewIndex < 0 ? 0 : reviewIndex
      //   data.manuscript.reviews[reviewIndex] = updateReview
      //   proxy.writeQuery({ query, data })
      // },
    })
  }

  const uploadFile = (file, updateReview, type) =>
    uploadReviewFilesMutation({
      variables: {
        file,
      },
    }).then(({ data }) => {
      const newFile = {
        url: data.upload.url,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        object: 'Review',
        objectId: updateReview.id,
        fileType: type,
      }
      createFile(newFile)
    })

  const handleSubmit = ({ reviewId, history }) => {
    completeReview({
      variables: {
        id: reviewId,
      },
    }).then(() => {
      history.push('/journal/dashboard')
    })
  }

  return (
    <Formik
      initialValues={
        (manuscript.reviews &&
          manuscript.reviews.find(
            review => review.user.id === currentUser.id && !review.isDecision,
          )) || {
          id: null,
          comments: [],
          recommendation: null,
        }
      }
      onSubmit={values =>
        handleSubmit({ reviewId: review.id, history: props.history })
      }
      validateOnMount={review => {
        if (!review.id) return false
        const hasRecommendation = review.recommendation !== null
        const comment = getCommentContent(review, 'note')
        const isCommented = comment !== null && comment !== ''

        return isCommented && hasRecommendation
      }}
    >
      {formikProps => (
        <ReviewLayout
          channelId={channelId}
          currentUser={currentUser}
          manuscript={manuscript}
          review={review}
          status={status}
          updateReview={updateReview}
          uploadFile={uploadFile}
          {...formikProps}
        />
      )}
    </Formik>
  )
}

// export default compose(
// graphql(query, {
//   options: ({ match }) => ({
//     variables: {
//       id: match.params.version,
//     },
//   }),
// }),
// graphql(uploadReviewFilesMutation, { name: 'uploadReviewFilesMutation' }),
// graphql(updateReviewMutation, { name: 'updateReviewMutation' }),
// graphql(updateTeam, { name: 'updateTeam' }),
// graphql(createFileMutation, {
//   props: ({ mutate, ownProps: { match } }) => ({
//     createFile: file => {
//       mutate({
//         variables: {
//           file,
//         },
//         update: (proxy, { data: { createFile } }) => {
//           const data = proxy.readQuery({
//             query,
//             variables: {
//               id: match.params.version,
//             },
//           })

//           data.manuscript.reviews.map(review => {
//             if (review.id === file.objectId) {
//               review.comments.map(comment => {
//                 if (comment.type === createFile.fileType) {
//                   comment.files = [createFile]
//                 }
//                 return comment
//               })
//             }
//             return review
//           })

//           proxy.writeQuery({ query, data })
//         },
//       })
//     },
//   }),
// }),
// withLoader(),
// withProps(
//   ({
//     manuscript,
//     currentUser,
//     match: {
//       params: { journal },
//     },
//     updateReviewMutation,
//     uploadReviewFilesMutation,
//     updateTeam,
//     createFile,
//   }) => ({
// journal: { id: journal },
// review:
//   manuscript.reviews.find(
//     review => review.user.id === currentUser.id && !review.isDecision,
//   ) || {},
// status: (
//   (
//     (manuscript.teams.find(team => team.role === 'reviewer') || {})
//       .status || []
//   ).find(status => status.user === currentUser.id) || {}
// ).status,
// updateReview: (review, file) => {
//   ;(review.comments || []).map(comment => {
//     delete comment.files
//     delete comment.__typename
//     return comment
//   })

//   const reviewData = {
//     recommendation: review.recommendation,
//     comments: review.comments,
//     manuscriptId: manuscript.id,
//   }

//   return updateReviewMutation({
//     variables: {
//       id: review.id || undefined,
//       input: reviewData,
//     },
//     update: (proxy, { data: { updateReview } }) => {
//       const data = JSON.parse(
//         JSON.stringify(
//           proxy.readQuery({
//             query,
//             variables: {
//               id: manuscript.id,
//             },
//           }),
//         ),
//       )
//       let reviewIndex = data.manuscript.reviews.findIndex(
//         review => review.id === updateReview.id,
//       )
//       reviewIndex = reviewIndex < 0 ? 0 : reviewIndex
//       data.manuscript.reviews[reviewIndex] = updateReview
//       proxy.writeQuery({ query, data })
//     },
//   })
// },
// uploadFile: (file, updateReview, type) =>
//   uploadReviewFilesMutation({
//     variables: {
//       file,
//     },
//   }).then(({ data }) => {
//     const newFile = {
//       url: data.upload.url,
//       filename: file.name,
//       mimeType: file.type,
//       size: file.size,
//       object: 'Review',
//       objectId: updateReview.id,
//       fileType: type,
//     }
//     createFile(newFile)
//   }),
//     completeReview: history => {
//       const team = cloneDeep(manuscript.teams).find(
//         team => team.role === 'reviewer',
//       )
//       team.members = team.members.map(m => {
//         if (m.user.id === currentUser.id) {
//           return { user: { id: m.user.id }, status: 'completed' }
//         }
//         return { user: { id: m.user.id }, status: m.status }
//       })

//       updateTeam({
//         variables: {
//           id: team.id,
//           input: {
//             members: team.members,
//           },
//         },
//       }).then(() => {
//         history.push('/dashboard')
//       })
//     },
//   }),
// ),
//   withFormik({
//     mapPropsToValues: props =>
//       props.manuscript.reviews.find(
//         review => review.user.id === props.currentUser.id && !review.isDecision,
//       ) || {
//         id: null,
//         comments: [],
//         recommendation: null,
//       },
//     isInitialValid: ({ review }) => {
//       if (!review.id) return false
//       const hasRecommendation = review.recommendation !== null
//       const comment = getCommentContent(review, 'note')
//       const isCommented = comment !== null && comment !== ''

//       return isCommented && hasRecommendation
//     },
//     displayName: 'review',
//     handleSubmit: (props, { props: { completeReview, history } }) =>
//       completeReview(history),
//   }),
// )(ReviewLayout)
