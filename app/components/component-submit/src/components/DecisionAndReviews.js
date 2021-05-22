import React from 'react'
// import styled from 'styled-components'

// TODO: Sort out the imports, perhaps make DecisionReview a shared component?
import Review from '../../../component-review/src/components/decision/DecisionReview'
import { UserAvatar } from '../../../component-avatar/src'

import {
  SectionHeader,
  SectionRow,
  Title,
  SectionContent,
} from '../../../shared'

const Decision = ({ decision, editor }) =>
  decision ? (
    <>
      <SectionRow>
        <p>Decision: {decision.recommendation}.</p>
      </SectionRow>
      <SectionRow>
        <p>Comment:</p>
        <p
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: decision?.decisionComment?.content,
          }}
        />
      </SectionRow>
      <SectionRow>
        <UserAvatar username={editor?.username} />
        Written by {editor?.defaultIdentity?.name}
      </SectionRow>
    </>
  ) : (
    <SectionRow>Pending.</SectionRow>
  )

const DecisionAndReviews = ({ manuscript, noGap }) => {
  const decision =
    manuscript.reviews &&
    !!manuscript.reviews.length &&
    manuscript.reviews.find(review => review.isDecision)

  const reviews =
    manuscript.reviews &&
    !!manuscript.reviews.length &&
    manuscript.reviews.filter(review => !review.isDecision)

  return (
    <>
      <SectionContent noGap={noGap}>
        <SectionHeader>
          <Title>Decision</Title>
        </SectionHeader>
        <Decision decision={decision} editor={decision?.user} />
      </SectionContent>
      <SectionContent>
        <SectionHeader>
          <Title>Reviews</Title>
        </SectionHeader>

        {reviews && reviews.length ? (
          reviews.map((review, index) => (
            <SectionRow key={review.id}>
              <Review
                open
                review={review}
                reviewer={{
                  name: review.user.username,
                  ordinal: index + 1,
                }}
              />
            </SectionRow>
          ))
        ) : (
          <SectionRow>No completed reviews.</SectionRow>
        )}
      </SectionContent>
    </>
  )
}

export default DecisionAndReviews
