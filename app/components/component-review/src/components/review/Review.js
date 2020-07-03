import React from 'react'
import styled from 'styled-components'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { getCommentFiles } from './util'

const Heading = styled.div``
const Note = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`
const Recommendation = styled(Note)``
const Content = styled.div``

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const findComments = (review = {}, type) => {
  const comments = review.comments || []
  return comments.find(comment => comment.type === type)
}

const ReviewComments = (review, type) => (
  <Note>
    <Content>
      <NoteViewer value={findComments(review, type).content} />
    </Content>
    {getCommentFiles(review, type).map(attachment => (
      <Attachment
        file={filesToAttachment(attachment)}
        key={attachment.url}
        uploaded
      />
    ))}
  </Note>
)

const Review = ({ review }) => (
  <div>
    {findComments(review, 'note') && (
      <div>
        <Heading>Note</Heading>

        {ReviewComments(review, 'note')}
      </div>
    )}
    {findComments(review, 'confidential') && (
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
  </div>
)

export default Review
