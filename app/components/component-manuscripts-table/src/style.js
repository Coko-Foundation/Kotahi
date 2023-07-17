import styled, { css } from 'styled-components'
import { Button, Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import { AlertCircle } from 'react-feather'
import Color from 'color'
import { color } from '../../../theme'

export const StyledButton = styled(Button)`
  cursor: pointer;
  max-width: 130px;
  min-width: unset;
  overflow-wrap: normal;
  padding: 4px;
  width: 100%;
`

export const UserAction = styled(Action)`
  cursor: pointer;
  display: block;
  font-size: inherit;
  opacity: ${({ isDisabled }) => (isDisabled ? '0.5' : '1')};
  width: fit-content;
`

export const InfoIcon = styled.div`
  align-items: center;
  background-color: #7cbff9;
  border-radius: 50%;
  color: white;
  display: flex;
  font-size: 110%;
  font-weight: bold;
  height: 25px;
  justify-content: center;
  line-height: 1.4ex;
  margin-left: 11px;
  min-height: 25px;
  min-width: 25px;

  &::before {
    content: 'i';
  }
`

export const StyledAuthor = styled.p`
  white-space: nowrap;
`

export const ManuscriptsTableStyled = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  width: 100%;
`

export const ManuscriptsRow = styled.div`
  align-items: center;
  background-color: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  text-align: left;
  width: 100%;

  &:first-child {
    border-top: none;
    padding: ${grid(0.5)} ${grid(2)};
  }

  &:not(:first-child) {
    padding: ${grid(1.5)} ${grid(2)};
  }
`

export const ClickableManuscriptsRow = styled(ManuscriptsRow)`
  color: ${color.text};

  &:hover {
    background-color: ${color.backgroundC};
    cursor: pointer;

    svg {
      stroke: ${color.brand1.base};
    }
  }
`
export const SnippetRow = styled.div`
  background-color: ${th('colorSecondaryBackground')};
  color: ${th('colorIconPrimary')};
  padding: ${grid(0.5)} ${grid(4)};
  text-align: left;
  width: 100%;
`

export const ManuscriptsHeaderRow = styled(ManuscriptsRow)`
  align-items: baseline;
  background-color: ${th('colorSecondaryBackground')};
  font-variant: all-small-caps;
  line-height: 1.25em;
`

export const Cell = styled.div`
  display: flex;
  flex: ${({ flex }) => flex ?? '0 1 12em'};
  flex-direction: row;
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}
  ${props =>
    props.centered &&
    css`
      justify-content: center;
    `}
  overflow-wrap: anywhere;
`

export const HeadingCell = styled(Cell)`
  align-items: center;
  display: flex;
`

/** Displays the label as a badge colored according to props.color */
export const LabelBadge = styled.div`
  border-radius: 8px;
  display: inline-block;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
  line-height: 1.1em;
  max-width: 100%;
  ${props =>
    props.color &&
    css`
      background-color: ${props.color};
      ${Color(props.color).isDark()
        ? css`
            color: ${th('colorTextReverse')};
          `
        : ''};
    `}
  overflow-wrap: normal;
  padding: ${grid(0.5)} ${grid(1)};
  text-overflow: clip;
`

export const SortArrow = styled.span`
  color: ${color.brand1.base};
  font-size: 70%;
  margin-left: 0.5em;

  &::before {
    content: '${({ direction }) => (direction === 'ASC' ? '▼' : '▲')}';
  }
`

export const StyledAlertCircle = styled(AlertCircle)`
  color: white;
  fill: red;
  height: 20px;
  width: 20px;
`
