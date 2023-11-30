import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'
import { color } from '../../../../theme'
import { RoundIconButton } from '../../../shared'

export const AdminSection = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

export const Roles = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 0.8em;
  justify-content: space-around;
  margin-bottom: 0.6em;
  margin-left: 0.5em;
  margin-top: 0;
  padding-left: 1.5em;
  text-transform: uppercase;
`

export const Role = styled.div`
  display: flex;

  &:not(:last-of-type) {
    margin-right: 3em;
  }
`

export const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const EditorWrapper = styled.div`
  .wax-container {
    position: relative;
  }
`

export const FormStatus = styled.div`
  color: ${color.brand2.base};
  line-height: ${grid(5)};
  text-align: center;
`

export const ErrorWrap = styled.div`
  .ProseMirror {
    margin-bottom: ${grid(4)};
  }
  ${({ error }) =>
    error &&
    css`
      .ProseMirror {
        border-color: red;
      }
      ${ErrorText} {
        margin-top: ${grid(-4)};
        margin-bottom: ${grid(1)};
      }
    `}

  [class*="MenuBar"] {
    margin-top: 0;
  }
`
export const ErrorText = styled.div`
  color: red;
`

export const RecommendationInputContainer = styled.div`
  line-height: ${grid(5)};
`

export const StyledNotifyButton = styled(Button)`
  cursor: pointer;
  height: 40px;
`

export const Heading = styled.span`
  font-weight: inherit;
  overflow: hidden;
  padding: 0 1em 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Cell = styled.span`
  grid-column: span 1 / span 1;
  overflow-wrap: break-word;
  padding: 0;
`

export const Affiliation = styled.span`
  color: ${color.gray40};
  margin-left: 0.5em;
`

export const Email = styled.span`
  color: ${color.brand1.base};
  margin-left: 1em;
`

export const BadgeContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 4px 18px;
`
export const ChatButton = styled(RoundIconButton)`
  margin-top: 16px;
  position: absolute;
  right: 18px;
`

export const CollapseButton = styled(RoundIconButton)`
  height: 33px;
  margin-top: 0;
  min-width: 0;
  position: absolute;
  right: 0;
  width: 33px;
`

export {
  Title,
  SectionHeader,
  SectionRow,
  SectionRowGrid,
  SectionAction,
  SectionActionInfo,
} from '../../../shared'
