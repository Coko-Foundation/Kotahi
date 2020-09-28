import React from 'react'
import styled, { css } from 'styled-components'
import { InfoArea } from 'wax-prosemirror-components'
import { componentPlugin } from 'wax-prosemirror-services'
import { th, grid } from '@pubsweet/ui-toolkit'
import EditorElements from './EditorElements'

// import { WaxContext } from 'wax-prosemirror-core/src/ioc-react'

const Layout = styled.div`
  background-color: ${th('colorBackground')};
  border-radius: 0 ${th('borderRadius')} ${th('borderRadius')}
    ${th('borderRadius')};
  // max-width: 90rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  display: grid;

  grid-template-areas: 'menu' 'editor';
  ${props =>
    props.readonly
      ? css`
          grid-template-rows: 0 1fr;
        `
      : css`
          grid-template-rows: 40px 1fr;
        `} // flex-direction: column;
  // height: 100vh;
  // width: 100hh;
`

const Editor = styled.div`
  grid-area: editor;
  // box-sizing: border-box;
  overflow: auto;
  padding: 16px;
  // padding: 0 2px 2px 2px;
  // height: 100%;
  ${EditorElements};
`

const Menu = styled.div`
  grid-area: menu;
  background: #fff;
  line-height: 40px;

  padding-left: 4px;
  user-select: none;
  border-bottom: 1px solid ${th('colorFurniture')};
  display: flex;
  align-items: center;

  // Hack to hide
  // TODO: https://gitlab.coko.foundation/wax/wax-prosemirror/issues/13
  button[title='show more tools'] {
    display: none;
  }
  button {
    padding: ${grid(1)};
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  position: sticky;
  top: 0;
  z-index: 10;
  border-top-right-radius: ${th('borderRadius')};
  border-top-left-radius: ${th('borderRadius')};
`

// export const Container = styled.div`
//   background-color: ${th('colorBackground')};
//   border-radius: ${th('borderRadius')};
// `

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
`
// const LeftSideBar = componentPlugin("leftSideBar");
// const RightSideBar = componentPlugin("rightSideBar");
const TopBar = componentPlugin('topBar')
// const NotesArea = componentPlugin("notesArea");
// const CommentsArea = componentPlugin("commentsArea");
const WaxOverlays = componentPlugin('waxOverlays')

const EditoriaLayout = readonly => ({ editor }) => (
  // const {
  //   view: { main },
  // } = useContext(WaxContext)
  <Container>
    <Layout readonly={readonly}>
      {!readonly && (
        <Menu>
          <TopBar />
        </Menu>
      )}
      <Editor className="wax-surface-scroll">{editor}</Editor>
    </Layout>
    <InfoArea />
    <WaxOverlays />
  </Container>
)

export default EditoriaLayout
