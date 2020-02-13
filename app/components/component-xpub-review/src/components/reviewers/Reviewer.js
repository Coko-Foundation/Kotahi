import React from 'react'
import styled from 'styled-components'
// import { map } from 'lodash'
// import Moment from 'react-moment'
import { Avatar } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'

const Root = styled.div`
  font-family: ${th('fontReviewer')};
  margin-right: ${th('gridUnit')};
  padding: ${th('gridUnit')};
`

const ordinalLetter = ordinal =>
  ordinal ? String.fromCharCode(96 + ordinal) : null

const Reviewer = ({ reviewer, removeReviewer }) => (
  <Root>
    <Avatar
      height={70}
      reviewerLetter={ordinalLetter(null)}
      status={reviewer.status || ''}
      width={100}
    />
    <div>{reviewer.user.username}</div>
    {/* <div>
      {map(reviewer.events, (event, key) => (
        <Event key={`${key}-${event}`}>
          {key} on <Moment format="YYYY-MM-DD">{event}</Moment>
        </Event>
      ))}
    </div>
    {reviewer.status === 'Pending' && (
      <Button onClick={removeReviewer}>x</Button>
    )} */}
  </Root>
)

export default Reviewer
