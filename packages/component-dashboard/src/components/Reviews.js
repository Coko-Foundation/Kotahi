import React from 'react'
import styled from 'styled-components'
import { compose, withProps } from 'recompose'
import { groupBy } from 'lodash'
import { withJournal } from 'xpub-journal'
import { Badge } from '@pubsweet/ui'

const Root = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  margin-bottom: 0.6em;
  margin-top: 0.3em;
  padding-left: 1.5em;

  font-family: var(--font-reviewer);
  font-size: 0.9em;
`

const BadgeContainer = styled.span`
  &:not(:last-child) {
    margin-right: 10px;
  }
`

const Reviews = ({ reviews, journal }) => (
  <Root>
    {journal.reviewStatus.map(status => (
      <BadgeContainer key={status}>
        <Badge
          count={reviews[status] ? reviews[status].length : 0}
          label={status}
        />
      </BadgeContainer>
    ))}
  </Root>
)

export default compose(
  withJournal,
  withProps(props => ({
    reviews: groupBy(props.version.reviewers, 'status'),
  })),
)(Reviews)
