import React from 'react'
import styled from 'styled-components'
import { sumBy } from 'lodash'
import { JournalContext } from '../../../xpub-journal'
import { Badge } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'

const Root = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  margin-bottom: 0.6em;
  margin-top: 0.3em;
  padding-left: 1.5em;

  font-family: ${th('fontReviewer')};
  font-size: 0.9em;
`

const BadgeContainer = styled.span`
  &:not(:last-child) {
    margin-right: 10px;
  }
`

const getUserFromTeam = (version, role) => {
  if (!version.teams) return []

  const teams = version.teams.filter(team => team.role === role)
  return teams.length ? teams[0].members : []
}

const countStatus = (version, status) => {
  const teamMember = getUserFromTeam(version, 'reviewerEditor')

  if (status === 'rejected' || status === 'invited') {
    return sumBy(teamMember, member => (member.status === status ? 1 : 0))
  }

  if (status === 'accepted') {
    return sumBy(version.reviews, review => (review.recommendation ? 0 : 1))
  }

  if (status === 'completed') {
    return sumBy(version.reviews, review => (review.recommendation ? 1 : 0))
  }

  return 0
}

const Reviews = ({ version, journal }) => (
  <Root>
    <JournalContext.Consumer>
      {journal =>
        journal.reviewStatus.map(status => (
          <BadgeContainer data-testid={status} key={status}>
            <Badge count={countStatus(version, status)} label={status} />
          </BadgeContainer>
        ))
      }
    </JournalContext.Consumer>
  </Root>
)

export default Reviews
