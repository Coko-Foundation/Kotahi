import React from 'react'
import { Attachment } from '@pubsweet/ui'

// TODO: Sort out the imports, perhaps make DecisionReview a shared component?
import DecisionReview from '../../../component-review/src/components/decision/DecisionReview'
import { UserAvatar } from '../../../component-avatar/src'
import useCurrentUser from '../../../../hooks/useCurrentUser'

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
      {decision?.decisionComment?.files?.length > 0 && (
        <SectionRow>
          {decision.decisionComment.files.map(f => (
            <Attachment
              file={{ ...f, url: f.storedObjects[0].url }}
              key={f.storedObjects[0].url}
              uploaded
            />
          ))}
        </SectionRow>
      )}
      <SectionRow>
        <UserAvatar username={editor?.username} />
        Written by {editor?.username}
      </SectionRow>
    </>
  ) : (
    <SectionRow>Pending.</SectionRow>
  )

const DecisionAndReviews = ({ manuscript }) => {
  const currentUser = useCurrentUser()

  const decision =
    manuscript.reviews &&
    !!manuscript.reviews.length &&
    manuscript.reviews.find(review => review.isDecision)

  const reviews =
    manuscript.reviews &&
    !!manuscript.reviews.length &&
    manuscript.reviews.filter(review => !review.isDecision)

  if (!currentUser) return null

  const authorTeam =
    manuscript.teams &&
    !!manuscript.teams.length &&
    manuscript.teams.find(team => {
      return team.role.toLowerCase().includes('author')
    })

  const isCurrentUserAuthor = authorTeam
    ? authorTeam.members.find(member => member.user.id === currentUser.id)
    : false

  return (
    <>
      <SectionContent>
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
          reviews
            .filter(review => !review.isHiddenFromAuthor && isCurrentUserAuthor)
            .map((review, index) => (
              <SectionRow key={review.id}>
                <DecisionReview
                  open
                  review={review}
                  reviewer={{
                    name: review.user.username,
                    ordinal: index + 1,
                    user: review.user,
                  }}
                  teams={manuscript.teams}
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
