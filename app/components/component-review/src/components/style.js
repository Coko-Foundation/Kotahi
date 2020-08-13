import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export const Columns = styled.div`
  display: grid;
  // grid-column-gap: 2em;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`

export const Manuscript = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;
  background: ${th('colorBackgroundHue')};
  padding: ${grid(2)};
`

export const Chat = styled.div`
  border-left: 1px solid ${th('colorFurniture')};
  grid-area: chat;
  height: 100vh;
  // overflow-y: scroll;
  display: flex;
`

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

export const Container = styled.div`
  max-width: 90rem;
  box-shadow: ${th('boxShadow')};
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  // padding: ${grid(2)} ${grid(3)};
  &:not(:first-of-type) {
    margin-top: ${grid(4)};
  }
`

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

export {
  Title,
  SectionHeader,
  SectionRow,
  SectionRowGrid,
  SectionAction,
} from '../../../shared'
