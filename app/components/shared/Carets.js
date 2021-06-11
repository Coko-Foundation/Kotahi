import React from 'react'
import styled, { css } from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'

export const Caret = styled.svg`
  ${props =>
    props.active
      ? css`
          color: ${th('colorPrimary')};
        `
      : css`
          color: ${th('colorSecondary')};
        `}
`

export const Carets = styled.span`
  align-items: center;
  display: inline-flex;
  flex-direction: column;
  margin-left: ${grid(0.5)};
  vertical-align: middle;

  svg {
    height: ${grid(1.5)};
  }

  svg:nth-of-type(2) {
    margin-top: ${grid(-0.5)};
  }
`

export const CaretUp = ({ active }) => (
  <Caret
    active={active}
    aria-hidden="true"
    className=""
    data-icon="caret-up"
    fill="currentColor"
    focusable="false"
    height="1em"
    viewBox="0 0 100 100"
    width="1em"
  >
    <path d="M50 17L100.229 67.25H-0.229473L50 17Z" />
  </Caret>
)

export const CaretDown = ({ active }) => (
  <Caret
    active={active}
    aria-hidden="true"
    className=""
    data-icon="caret-down"
    fill="currentColor"
    focusable="false"
    height="1em"
    viewBox="0 0 100 100"
    width="1em"
  >
    <path d="M50 84L-0.229473 33.75L100.229 33.75L50 84Z" />
  </Caret>
)
