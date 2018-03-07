import React from 'react'
import styled from 'styled-components'
import { map } from 'lodash'
import Moment from 'react-moment'
import { Avatar, Button, th } from '@pubsweet/ui'

const Root = styled.div`
  font-family: ${th('fontReviewer')};
  margin-right: ${th('subGridUnit')};
  padding: ${th('subGridUnit')};
`

const Event = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
`

const ordinalLetter = ordinal =>
  ordinal ? String.fromCharCode(96 + ordinal) : null

const Reviewer = ({ reviewer, removeReviewer }) => (
  <Root>
    <Avatar
      height={70}
      reviewerLetter={ordinalLetter(reviewer._reviewer.ordinal)}
      status={reviewer.status}
      width={100}
    />
    <div>
      {reviewer._user ? reviewer._user.username : reviewer._reviewer.user}
    </div>
    <div>
      {map(reviewer.events, (event, key) => (
        <Event key={`${key}-${event}`}>
          {key} on <Moment format="YYYY-MM-DD">{event}</Moment>
        </Event>
      ))}
    </div>
    {reviewer.status === 'Pending' && (
      <Button onClick={removeReviewer}>x</Button>
    )}
  </Root>
)

export default Reviewer
