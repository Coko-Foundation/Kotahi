import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

// TODO: move labels to journal config

const labels = {
  accepted: 'Accepted',
  assignedToEditor: 'Assigned to editor',
  assigningReviewers: 'Assigning reviewers',
  new: 'Unsubmitted',
  rejected: 'Rejected',
  submitted: 'Submitted',
  revising: 'Back with Author for Revision',
}

const Root = styled.div`
  color: ${th('colorPrimary')};
`

const Status = ({ status }) => <Root>{labels[status] || 'Unsubmitted'}</Root>

export default Status
