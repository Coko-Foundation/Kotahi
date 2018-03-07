import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui'

const Root = styled.div`
  display: flex;
  margin-top: ${th('gridUnit')};
`
const Form = styled.div``
const ReviewersList = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Reviewers = ({
  ReviewerForm,
  Reviewer,
  project,
  version,
  reviewers,
  reviewerUsers,
}) => (
  <Root>
    <Form>
      <ReviewerForm
        project={project}
        reviewerUsers={reviewerUsers}
        version={version}
      />
    </Form>

    {reviewers && (
      <ReviewersList>
        {reviewers.map(reviewer => (
          <Reviewer key={reviewer.id} project={project} reviewer={reviewer} />
        ))}
      </ReviewersList>
    )}
  </Root>
)

export default Reviewers
