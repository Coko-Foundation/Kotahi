import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Attachment } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'

const Heading = styled.h4``

const Note = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const Recommendation = styled(Note)``
const Content = styled.div``

const Container = styled.div`
  & > div {
    margin-bottom: 12px;
  }
`

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const ReviewComments = (review, type) => (
  <Note>
    <Content>
      <SimpleWaxEditor readonly value={review[`${type}Comment`].content} />
    </Content>
    {review[`${type}Comment`].files.map(attachment => (
      <Attachment
        file={filesToAttachment(attachment)}
        key={attachment.url}
        uploaded
      />
    ))}
  </Note>
)

const Review = ({ review, user, showUserInfo = true }) => (
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

    {review?.reviewComment && (
      <>
        <Heading>Review</Heading>
        {ReviewComments(review, 'review')}
      </>
    )}
    {review?.confidentialComment && user.admin ? (
      <div>
        <Heading>Confidential</Heading>
        {ReviewComments(review, 'confidential')}
      </div>
    ) : null}
    {review?.recommendation && (
      <div>
        <Heading>Recommendation</Heading>
        <Recommendation>{review.recommendation}</Recommendation>
      </div>
    )}
  </Container>
)

Review.propTypes = {
  review: PropTypes.shape({
    reviewComment: PropTypes.shape({
      content: PropTypes.string.isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          filename: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }),
    confidentialComment: PropTypes.shape({
      content: PropTypes.string.isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          filename: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }),
    recommendation: PropTypes.string,
  }),
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
