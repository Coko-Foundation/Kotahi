import React from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'

const Status = styled.span`
  border-radius: 8px;
  font-variant: all-small-caps;
  font-size: ${th('fontSizeBaseSmall')};
  ${props =>
    !props.minimal &&
    css`
      padding: ${grid(0.5)} ${grid(1)};
    `}
`

export const SuccessStatus = styled(Status)`
  ${props =>
    props.minimal
      ? css`
          color: ${th('colorSuccess')};
        `
      : css`
          background-color: ${th('colorSuccess')};
          color: ${th('colorTextReverse')};
        `}
`

export const ErrorStatus = styled(Status)`
  ${props =>
    props.minimal
      ? css`
          color: ${th('colorError')};
        `
      : css`
          background-color: ${th('colorError')};
          color: ${th('colorTextReverse')};
        `}
`

export const NormalStatus = styled(Status)`
  // background-color: ${th('colorWarning')};
  // color: ${th('colorTextReverse')};
  ${props =>
    props.minimal
      ? css`
          color: ${th('colorPrimary')};
        `
      : css`
          background-color: ${th('colorWarning')};
        `}
`

const label = status => {
  const labels = {
    accepted: 'Accepted',
    assignedToEditor: 'Assigned to editor',
    assigningReviewers: 'Assigning reviewers',
    new: 'Unsubmitted',
    rejected: 'Rejected',
    submitted: 'Submitted',
    revise: 'Revising',
    invited: 'Invited', // reviewer status
    completed: 'Completed', // reviewer status
  }
  return labels[status] || `Unknown (${status})`
}

export const StatusBadge = ({ status, minimal }) => {
  if (status === 'accepted') {
    return <SuccessStatus minimal={minimal}>{label(status)}</SuccessStatus>
  } else if (status === 'rejected') {
    return <ErrorStatus minimal={minimal}>{label(status)}</ErrorStatus>
  }
  return <NormalStatus minimal={minimal}>{label(status)}</NormalStatus>
}
