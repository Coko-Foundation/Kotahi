/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */

import React from 'react'
import styled from 'styled-components'
import { sumBy } from 'lodash'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../xpub-journal/src'

const Root = styled.div`
  display: inline-flex;
  font-family: ${th('fontReviewer')};
  font-size: 0.9em;
  margin-bottom: 0.6em;
  margin-top: 0.3em;
`

const CountLabel = styled.span`
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
  const teamMembers = getUserFromTeam(version, 'reviewer')

  if (teamMembers) {
    return sumBy(teamMembers, member => (member.status === status ? 1 : 0))
  }

  return 0
}

const Reviews = ({ version, journal }) => (
  <Root>
    <JournalContext.Consumer>
      {journal =>
        journal.reviewStatus.map(status => (
          <CountLabel data-testid={status} key={status}>
            {countStatus(version, status)} {status}
          </CountLabel>
        ))
      }
    </JournalContext.Consumer>
  </Root>
)

export default Reviews
