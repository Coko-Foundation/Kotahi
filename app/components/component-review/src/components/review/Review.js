import React from 'react'
import styled from 'styled-components'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'

const Heading = styled.div``
const Note = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`
const Recommendation = styled(Note)``
const Content = styled.div``
const Container = styled.div`
  margin-top: ${grid(3)};
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
      <NoteViewer value={review[`${type}Comment`].content} />
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

const Review = ({ review }) => (
  <Container>
    {review.reviewComment && (
      <div>
        <Heading>Review</Heading>

        {ReviewComments(review, 'review')}
      </div>
    )}
    {review.confidentialComment && (
      <div>
        <Heading>Confidential</Heading>

        {ReviewComments(review, 'confidential')}
      </div>
    )}
    {review.recommendation && (
      <div>
        <Heading>Recommendation</Heading>

        <Recommendation>{review.recommendation}</Recommendation>
      </div>
    )}
  </Container>
)

export default Review
