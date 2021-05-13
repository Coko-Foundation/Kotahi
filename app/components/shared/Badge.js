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
  cursor: pointer;
  ${props =>
    props.minimal
      ? css`
          color: ${th('colorPrimary')};
        `
      : css`
          background-color: ${th('colorWarning')};
        `}
`

const label = (status, published) => {
  const isPublished = !!published
  const labels = {
    accepted: 'Accepted',
    assignedToEditor: 'Assigned to editor',
    assigningReviewers: 'Assigning reviewers',
    new: 'Unsubmitted',
    rejected: 'Rejected',
    submitted: 'Submitted',
    revise: 'Revise',
    revising: 'Revising',
    invited: 'Invited', // reviewer status
    completed: 'Completed', // reviewer status
    evaluated: 'evaluated',
    published: 'published',
  }

  if (isPublished) {
    return labels[status]
      ? `${labels[status]} & Published`
      : `Unknown (${status} & Published})`
  }
  return labels[status] || `Unknown ${status}`
}

// TODO: Make this configurable
export const StatusBadge = ({ status, published, minimal }) => {
  if (status === 'accepted') {
    return (
      <SuccessStatus minimal={minimal}>
        {label(status, published)}
      </SuccessStatus>
    )
  } else if (status === 'rejected') {
    return (
      <ErrorStatus minimal={minimal}>{label(status, published)}</ErrorStatus>
    )
  }
  return (
    <NormalStatus minimal={minimal}>{label(status, published)}</NormalStatus>
  )
}
