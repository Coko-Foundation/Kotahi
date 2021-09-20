import React, { useContext } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import EditorElements from '../EditorElements'

const Grid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';
  ${props =>
    props.readonly
      ? css`
          grid-template-rows: 0 1fr;
        `
      : css`
          grid-template-rows: minmax(40px, auto) 1fr;
        `}

  position: relative;
  z-index: 0;

  :focus-within {
    z-index: 10000;
  }
`

const EditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  border: 1px solid ${th('colorBorder')};
  border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  border-top: none;
  box-sizing: border-box;
  display: flex;
  grid-area: editor;
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  position: relative;
  width: 100%;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const EditorContainer = styled.div`
  height: 100%;
  width: 100%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;

    & .comment {
      border-bottom-color: transparent;
    }
  }
`

const ReadOnlyEditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  grid-area: editor;
  overflow: auto;
  padding: 16px;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const Menu = styled.div`
  align-items: center;
  background: #fff;
  border: 1px solid ${th('colorBorder')};
  border-bottom: 1px solid ${th('colorFurniture')};
  display: flex;
  flex-wrap: wrap;
  font-size: 80%;
  grid-area: menu;
  height: fit-content;
  max-width: 100%;
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 10;

  & > div {
    height: 36px;
  }
`

const InfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;
  z-index: 999;
`

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
// const NotesArea = ComponentPlugin('notesArea')
// const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('BottomRightInfo')
// const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')

// eslint-disable-next-line react/prop-types
const ProductionWaxEditorNoNotesLayout = readonly => ({ editor }) => {
  const {
    // view: { main },
    options,
  } = useContext(WaxContext)

  // added to bring in full screen

  let fullScreenStyles = {}

  if (options.fullScreen) {
    fullScreenStyles = {
      backgroundColor: '#fff',
      height: '100%',
      left: '0',
      margin: '0',
      padding: '0',
      position: 'fixed',
      top: '0',
      width: '100%',
      zIndex: '99999',
    }
  }

  return (
    <div style={fullScreenStyles}>
      <Grid readonly={readonly}>
        {readonly ? (
          <ReadOnlyEditorDiv className="wax-surface-scroll">
            {editor}
          </ReadOnlyEditorDiv>
        ) : (
          <>
            <Menu>
              <TopBar />
            </Menu>
            <EditorDiv className="wax-surface-scroll">
              <EditorContainer>{editor}</EditorContainer>
            </EditorDiv>
          </>
        )}
      </Grid>
      <WaxOverlays />
      <InfoContainer>
        <CounterInfo />
      </InfoContainer>
    </div>
  )
}

export default ProductionWaxEditorNoNotesLayout
