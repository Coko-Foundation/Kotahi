import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'
import { Typeahead } from 'react-bootstrap-typeahead'

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

// export const Container = styled.div`
//   // max-width: 90rem;
//   box-shadow: ${th('boxShadow')};
//   background-color: ${th('colorBackground')};
//   border-radius: ${({ noGap }) =>
//     noGap
//       ? css`0 ${th('borderRadius')} ${th('borderRadius')}`
//       : th('borderRadius')};
//   // padding: ${grid(2)} ${grid(3)};
//   &:not(:first-of-type) {
//     margin-top: ${grid(4)};
//   }
// `

export const FormStatus = styled.div`
  color: ${th('colorSecondary')};
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

export const StyledTypeahead = styled(Typeahead)`
  position: relative;

  input {
    border: 1px solid #aaa;
    border-color: #aaa;
    border-radius: 8px;
    font-size: 15px;
    height: 40px;
    outline: 0;
    padding: 0 8px;
    transition: 0.2s ease;
    width: 100%;
  }

  .dropdown-menu {
    background-color: white;
    border: 1px solid #aaa;
    border-radius: 8px;
    box-sizing: border-box;
    margin-top: 8px;
    position: absolute;
    width: 100%;
    z-index: 2;
  }

  .dropdown-item {
    color: black;
    display: block;
    padding: 12px;
    width: 100%;

    &:hover {
      background-color: #eee;
    }
  }
`

export {
  Title,
  SectionHeader,
  SectionRow,
  SectionRowGrid,
  SectionAction,
  SectionActionInfo,
} from '../../../shared'
