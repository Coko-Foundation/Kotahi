import React from 'react'
import styled from 'styled-components'
import { Link } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import ReviewerForm from './ReviewerForm'

const Root = styled.div`
  display: flex;
  margin-top: calc(${th('gridUnit')} * 3);
`
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
  <Root>
    <Form>
      <ReviewerForm
        handleSubmit={handleSubmit}
        isValid={isValid}
        journal={journal}
        loadOptions={loadOptions}
        reviewerUsers={reviewerUsers}
      />
      <Link
        to={`/journals/${journal.id}/versions/${manuscript.id}/decisions/${manuscript.id}`}
      >
        Back to Control Panel
      </Link>
    </Form>

    {reviewers && (
      <ReviewersList>
        {reviewers.map(reviewer => (
          <Reviewer journal={journal} key={reviewer.id} reviewer={reviewer} />
        ))}
      </ReviewersList>
    )}
  </Root>
)

export default Reviewers
