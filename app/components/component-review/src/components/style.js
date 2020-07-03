import styled from 'styled-components'
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
    .main-editor {
      margin: 3% 0 0 0;
    }
  }
`

export const Container = styled.div`
  max-width: 90rem;
  box-shadow: ${th('boxShadow')};
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  // padding: ${grid(2)} ${grid(3)};
`

export const Title = styled.h2`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const SectionHeader = styled.div`
  padding: ${grid(2)} ${grid(3)};
  border-bottom: 1px solid ${th('colorFurniture')};
`

export const SectionRow = styled.div`
  border-bottom: 1px solid ${th('colorFurniture')};
  padding: ${grid(2)} ${grid(3)};
`

export const SectionRowGrid = styled(SectionRow)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: ${grid(2)};
`

export const SectionAction = styled.div`
  grid-column: 3;
  justify-self: end;
`
