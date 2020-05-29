import React from 'react'
import styled from 'styled-components'
import { InfoArea } from 'wax-prosemirror-components'
import { componentPlugin } from 'wax-prosemirror-core'
import EditorElements from './EditorElements'
// import { WaxContext } from 'wax-prosemirror-core/src/ioc-react'

const Layout = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';
  grid-template-rows: 40px 1fr;
  // flex-direction: column;
  height: 100vh;
  width: 100hh;
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
  border-bottom: 1px solid #ecedf1;
  display: flex;
  align-items: center;

  // Hack to hide
  // TODO: https://gitlab.coko.foundation/wax/wax-prosemirror/issues/13
  button[title='show more tools'] {
    display: none;
  }
  div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

// const LeftSideBar = componentPlugin("leftSideBar");
// const RightSideBar = componentPlugin("rightSideBar");
const TopBar = componentPlugin('topBar')
// const NotesArea = componentPlugin("notesArea");
// const CommentsArea = componentPlugin("commentsArea");
const WaxOverlays = componentPlugin('waxOverlays')

const EditoriaLayout = ({ editor }) => (
  // const {
  //   view: { main },
  // } = useContext(WaxContext)
  <>
    <Layout>
      <Menu>
        <TopBar />
      </Menu>
      <Editor className="wax-surface-scroll">{editor}</Editor>
    </Layout>
    <InfoArea />
    <WaxOverlays />
  </>
)

export default EditoriaLayout
