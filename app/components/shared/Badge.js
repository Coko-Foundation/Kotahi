import React from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'
import { color } from '../../theme'

export const Status = styled.span`
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

 ${props =>
    props.color &&
    css`
      background-color: ${props.color};
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
          color: ${color.textReverse};
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
          color: ${color.textReverse};
        `}
`

export const NormalStatus = styled(Status)`
  ${props =>
    props.minimal
      ? css`
          color: ${color.brand1.base};
        `
      : css`
          background-color: ${th('colorWarning')};
        `}
`

export const ConfigurableStatus = styled(Status)`
  ${props => css`
    color: ${props.lightText ? color.textReverse : color.text};
    background-color: ${props.color};
  `}
`

export const label = (status, published) => {
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
    inProgress: 'In Progress', // reviewer status
    completed: 'Completed', // reviewer status
    unanswered: 'Invited',
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
export const StatusBadge = ({
  status,
  published,
  minimal,
  clickable,
  styles,
}) => {
  if (status === 'accepted' || status === 'published') {
    return (
      <SuccessStatus clickable={clickable} minimal={minimal} style={styles}>
        {label(status, published)}
      </SuccessStatus>
    )
  }

  if (status === 'rejected') {
    return (
      <ErrorStatus clickable={clickable} minimal={minimal} style={styles}>
        {label(status, published)}
      </ErrorStatus>
    )
  }

  return (
    <NormalStatus clickable={clickable} minimal={minimal} style={styles}>
      {label(status, published)}
    </NormalStatus>
  )
}
