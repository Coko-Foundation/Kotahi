import React from 'react'
import { useQuery, gql } from '@apollo/client'
import ReactRouterPropTypes from 'react-router-prop-types'
import ReviewPreview from './reviewPreview/ReviewPreview'
import { Heading, Page, Spinner } from '../../../shared'

const fragmentFields = `
  id
  created
  status
  meta {
    manuscriptId
    title
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
    keywords
  }
  submission
`

const query = gql`
  query($id: ID!) {
    manuscript(id: $id) {
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
    }

    formForPurpose(purpose: "submit") {
      structure {
        children {
          title
          shortDescription
          id
          component
          name
          includeInReviewerPreview
          format
        }
      }
    }
  }
`

const ReviewPreviewPage = ({ match }) => {
  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
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

  const { manuscript, formForPurpose } = data

  const submissionForm = formForPurpose?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <ReviewPreview manuscript={manuscript} submissionForm={submissionForm} />
  )
}

ReviewPreviewPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
}

export default ReviewPreviewPage
