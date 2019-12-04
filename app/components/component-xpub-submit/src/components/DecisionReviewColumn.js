import React from 'react'
import styled from 'styled-components'
import { Section } from '../styles'
import { Review } from './atoms/Columns'
import Accordion from './molecules/Accordion'

const ReviewAccord = styled.div``

const ReviewsItem = styled.div`
  margin-left: 1em;
`

const ReviewAccordion = ({ reviews }) => (
  <ReviewAccord>
    {reviews.length > 0 &&
      reviews.map(
        (review, reviewId) =>
          review.comments.length &&
          review.comments.map((comment, commentId) => (
            <Accordion
              Component={comment.content}
              key={`accordion-review-${review.id}`}
              ordinal={reviewId + 1}
              title="Review"
              withDots="true"
            />
          )),
      )}
  </ReviewAccord>
)

const DecisionReviewColumn = ({
  manuscript,
  handleSubmit,
  toggleOpen,
  open,
}) => (
  <Review>
    <Accordion
      Component={<ReviewsItem>{manuscript.decision}</ReviewsItem>}
      key="decision"
      status="revise"
      title="Decision"
    />
    <ReviewsItem>
      {manuscript.reviews && (
        <Section id="accordion.review">
          <Accordion
            Component={
              <ReviewAccordion
                reviews={manuscript.reviews.filter(
                  review => !review.isDecision,
                )}
              />
            }
            key="review"
            title="Reviews"
          />
        </Section>
      )}
    </ReviewsItem>
  </Review>
)

export default DecisionReviewColumn
