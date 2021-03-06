import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export const AdminSection = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

export const Roles = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  font-size: 0.8em;
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
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
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
  line-height: ${grid(5)};
  text-align: center;
  color: ${th('colorSecondary')};
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

export {
  Title,
  SectionHeader,
  SectionRow,
  SectionRowGrid,
  SectionAction,
  SectionActionInfo,
} from '../../../shared'
