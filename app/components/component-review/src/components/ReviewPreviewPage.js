import React, { useContext } from 'react'
import { useQuery, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import ReviewPreview from './reviewPreview/ReviewPreview'
import { Heading, Page, Spinner } from '../../../shared'
import { ConfigContext } from '../../../config/src'

const fragmentFields = `
  id
  shortId
  created
  status
  meta {
    manuscriptId
    title
    abstract
  }
  submission
  files {
    id
    name
    tags
    storedObjects {
      mimetype
      url
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      structure {
        children {
          title
          shortDescription
          id
          component
          name
          hideFromReviewers
          format
        }
      }
    }
  }
`

const ReviewPreviewPage = ({ match, currentUser }) => {
  const config = useContext(ConfigContext)

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
    partialRefetch: true,
  })

  if (loading) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, formForPurposeAndCategory } = data

  const submissionForm = formForPurposeAndCategory?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  // Currently not expecting to preview threadedDiscussions from the ReviewPreviewPage
  const threadedDiscussionDummyProps = {
    threadedDiscussions: [],
  }

  return (
    <ReviewPreview
      manuscript={manuscript}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionDummyProps}
    />
  )
}

ReviewPreviewPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ReviewPreviewPage
