import React from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'
import i18next from 'i18next'
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

  if (isPublished && ['accepted', 'evaluated', 'published'].includes(status))
    return i18next.t('msStatus.published')

  const unknownFallback = `${i18next.t('msStatus.unknown')} (${status})`
  const mainStatus = i18next.t(`msStatus.${status}`, unknownFallback)
  if (isPublished) return `${mainStatus} & ${i18next.t('msStatus.published')}`
  return mainStatus
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
