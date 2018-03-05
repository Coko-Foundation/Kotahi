import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui'

// TODO: move labels to journal config

const labels = {
  accepted: 'Accepted',
  assignedToEditor: 'Assigned to editor',
  assigningReviewers: 'Assigning reviewers',
  new: 'Unsubmitted',
  rejected: 'Rejected',
  submitted: 'Submitted',
  revising: 'Under Revision',
}

const Root = styled.div`
  color: ${th('colorPrimary')};
`

const Status = ({ status }) => <Root>{labels[status] || 'Unsubmitted'}</Root>

export default Status
