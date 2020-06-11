import { compose, withProps } from 'recompose'
import { graphql } from '@apollo/react-hoc'
import gql from 'graphql-tag'
import { withFormik } from 'formik'
import { withLoader } from 'pubsweet-client'
import { getCommentContent } from './review/util'

import DecisionLayout from './decision/DecisionLayout'

// import { dashboard } from '../../../component-xpub-dashboard/src/graphql/queries'

// /graphql/queries/'

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
    }
  }
`

const updateReviewMutation = gql`
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

const submitMutation = gql`
  mutation($id: ID!, $input: String) {
    submitManuscript(id: $id, input: $input) {
      id
      ${fragmentFields}
    }
  }
`

export default compose(
  graphql(query, {
    options: ({ match }) => ({
      variables: {
        id: match.params.version,
      },
    }),
  }),
  graphql(uploadReviewFilesMutation, { name: 'uploadReviewFilesMutation' }),
  graphql(updateReviewMutation, { name: 'updateReviewMutation' }),
  graphql(createFileMutation, {
    props: ({ mutate, ownProps: { match } }) => ({
      createFile: file => {
        mutate({
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
      },
    }),
  }),
  graphql(submitMutation, {
    props: ({ mutate, ownProps }) => ({
      completeDecision: ({ history, manuscript }) => {
        mutate({
          variables: {
            id: manuscript.id,
            input: JSON.stringify({
              decision: manuscript.reviews.find(review => review.isDecision)
                .recommendation,
            }),
          },
          refetchQueries: [
            {
              query,
            },
          ],
          // update: (proxy, { data: { submitManuscript } }) => {
          //   const data = proxy.readQuery({
          //     query,
          //     variables: {
          //       id: manuscript.id,
          //     },
          //   })
          //   // TODO: Remove trick to replace existing manuscript
          //   data.manuscript.status = submitManuscript.status
          //   proxy.writeQuery({ query, data })
          // },
        }).then(() => {
          history.push('/dashboard')
        })
      },
    }),
  }),
  withLoader(),
  withProps(
    ({
      currentUser,
      manuscript,
      createFile,
      updateReviewMutation,
      uploadReviewFilesMutation,
      match: {
        params: { journal },
      },
    }) => ({
      journal: { id: journal },
      updateReview: (data, file) => {
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

        const review =
          manuscript.reviews.find(review => review.isDecision) || {}
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
      },
      uploadFile: (file, updateReview, type) =>
        uploadReviewFilesMutation({
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
        }),
    }),
  ),
  withFormik({
    mapPropsToValues: props =>
      (props.manuscript.reviews &&
        props.manuscript.reviews.find(review => review.isDecision)) || {
        comments: [],
        recommendation: null,
      },
    isInitialValid: ({ manuscript }) => {
      const rv = manuscript.reviews.find(review => review.isDecision) || {}
      const isRecommendation = rv.recommendation != null
      const isCommented = getCommentContent(rv, 'note') !== ''

      return isCommented && isRecommendation
    },
    validate: (values, props) => {
      const errors = {}
      if (getCommentContent(values, 'note') === '') {
        errors.comments = 'Required'
      }

      if (values.recommendation === null) {
        errors.recommendation = 'Required'
      }
      return errors
    },
    displayName: 'decision',
    handleSubmit: (
      props,
      { props: { completeDecision, history, manuscript } },
    ) => completeDecision({ history, manuscript }),
  }),
)(DecisionLayout)
