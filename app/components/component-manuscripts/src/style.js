import styled, { css } from 'styled-components'
import { Button, Action } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import Color from 'color'

export const StyledButton = styled(Button)`
  cursor: pointer;
`

export const FloatRightButton = styled(StyledButton)`
  float: right;
  margin-left: ${grid(2)};
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

export const SelectAllField = styled.div`
  align-items: center;
  display: flex;
  margin-top: 10px;
`
export const SelectedManuscriptsNumber = styled.p`
  font-weight: bold;
  margin-left: 10px;
  margin-right: 15px;
`

export const StyledAuthor = styled.p`
  white-space: nowrap;
`

export const BulkDeleteModalContainer = styled.div`
  background-color: white;
  padding: 10px;
`

export const BulkDeleteModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BulkDeleteModalButton = styled(Button)`
  cursor: pointer;
`

export const ManuscriptsTable = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  margin-top: ${grid(1)};
  width: 100%;
`

export const ManuscriptsRow = styled.div`
  align-items: center;
  background-color: white;
  border-bottom: 1px solid ${th('colorFurniture')};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  padding: ${grid(0.5)} ${grid(2)};
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
  flex: ${({ flex }) => flex ?? '0 1 12em'};

  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}
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
  padding: ${grid(0.5)} ${grid(1)};
`

export const SortArrow = styled.span`
  color: ${th('colorPrimary')};
  font-size: 70%;
  margin-left: 0.5em;

  &::before {
    content: '${({ direction }) => (direction === 'ASC' ? '▼' : '▲')}';
  }
`
