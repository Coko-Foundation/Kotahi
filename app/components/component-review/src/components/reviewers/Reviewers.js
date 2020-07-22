import React from 'react'
import styled from 'styled-components'
import { Link } from '@pubsweet/ui'
import ReviewerForm from './ReviewerForm'
import { Container, PaddedContent } from '../../../../shared'

// TODO: Make this a proper shared component?
import { UserAvatar } from '../../../../component-avatar/src'

const Form = styled.div``
const ReviewersList = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Reviewers = ({
  Reviewer,
  journal,
  isValid,
  loadOptions,
  version,
  reviewers,
  reviewerUsers,
  manuscript,
  handleSubmit,
  teams,
}) => (
  <Container>
    <PaddedContent>
      <Form>
        <ReviewerForm
          handleSubmit={handleSubmit}
          isValid={isValid}
          journal={journal}
          loadOptions={loadOptions}
          reviewerUsers={reviewerUsers}
        />
        <Link
          to={`/journal/versions/${manuscript.id}/decisions/${manuscript.id}`}
        >
          Back to Control Panel
        </Link>
      </Form>
    </PaddedContent>
    <PaddedContent>
      {reviewers && (
        <ReviewersList>
          {reviewers.map(reviewer => (
            <UserAvatar key={reviewer.id} user={reviewer.user} />
            // <Reviewer journal={journal} key={reviewer.id} username={reviewer.user.username} />
          ))}
        </ReviewersList>
      )}
    </PaddedContent>
  </Container>
)

export default Reviewers
