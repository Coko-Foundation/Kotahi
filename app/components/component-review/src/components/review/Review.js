import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'

const Heading = styled.h4``

const Container = styled.div`
  & > div {
    margin-bottom: 12px;
  }
`

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
/*
const filesToAttachment = file => ({
  name: file.name,
  url: file.storedObjects[0].url,
})
*/

const Review = ({
  review,
  reviewForm,
  user,
  showUserInfo = true,
  threadedDiscussionProps,
}) => (
  <Container>
    {!review.isHiddenReviewerName && showUserInfo && (
      <div>
        <Heading>
          <strong>{review.user.username}</strong>
        </Heading>
        {review.user.defaultIdentity.identifier}
      </div>
    )}

    {review.isHiddenReviewerName && showUserInfo && (
      <div>
        <Heading>
          <strong style={{ color: '#545454' }}>Anonymous Reviewer</strong>
        </Heading>
      </div>
    )}

    <ReadonlyFormTemplate
      form={reviewForm}
      formData={ensureJsonIsParsed(review.jsonData) ?? {}}
      hideSpecialInstructions
      showEditorOnlyFields={user.admin}
      threadedDiscussionProps={threadedDiscussionProps}
    />
  </Container>
)

Review.propTypes = {
  review: PropTypes.shape({}),
  user: PropTypes.shape({
    admin: PropTypes.bool,
  }),
}

Review.defaultProps = {
  review: null,
  user: {
    admin: false,
  },
}
export default Review
