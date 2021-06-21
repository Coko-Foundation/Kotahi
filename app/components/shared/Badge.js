import React from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'

const Status = styled.span`
  border-radius: 8px;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
  ${props =>
    !props.minimal &&
    css`
      padding: ${grid(0.5)} ${grid(1)};
    `}
  ${props =>
    props.clickable &&
    css`
      cursor: pointer;
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
    if (['accepted', 'evaluated', 'published'].includes(status))
      return 'Published'
    return `${labels[status] ?? `Unknown (${status})`} & Published`
  }

  return labels[status] ?? `Unknown (${status})`
}

// TODO: Make this configurable
export const StatusBadge = ({ status, published, minimal, clickable }) => {
  if (status === 'accepted' || status === 'published') {
    return (
      <SuccessStatus clickable={clickable} minimal={minimal}>
        {label(status, published)}
      </SuccessStatus>
    )
  }

  if (status === 'rejected') {
    return (
      <ErrorStatus clickable={clickable} minimal={minimal}>
        {label(status, published)}
      </ErrorStatus>
    )
  }

  return (
    <NormalStatus clickable={clickable} minimal={minimal}>
      {label(status, published)}
    </NormalStatus>
  )
}
