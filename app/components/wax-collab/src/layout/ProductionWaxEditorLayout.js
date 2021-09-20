import React, { useCallback, useContext, useState, useEffect } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
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
  width: 65%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;
  }
`

const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

const CommentsContainerNotes = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 35%;
`

const CommentTrackToolsContainer = styled.div`
  background: white;
  display: flex;
  padding-top: 5px;
  position: fixed;
  right: 30px;
  width: 25%;
  z-index: 1;
`

const CommentTrackTools = styled.div`
  display: flex;
  margin-left: auto;
  position: relative;
  z-index: 1;
`

const CommentTrackOptions = styled.div`
  bottom: 5px;
  display: flex;
  margin-left: 10px;
  position: relative;
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

const NotesAreaContainer = styled.div`
  background: #fff;
  bottom: ${grid(-2)};
  box-shadow: 0 ${grid(-0.3)} ${grid(0.5)} ${grid(-0.2)} gray;
  height: 20vh;
  overflow-y: scroll;
  position: sticky;
  width: 100%;

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const ReadOnlyNotesAreaContainer = styled.div`
  background: #fff;
  border-top: 1px solid ${th('colorFurniture')};
  width: 100%;

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const NotesContainer = styled.div`
  counter-reset: footnote-view;
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  width: 90%;
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  margin: 3px 7px;
  text-transform: uppercase;
`

const getNotes = main => {
  const notes = DocumentHelpers.findChildrenByType(
    main.state.doc,
    main.state.schema.nodes.footnote,
    true,
  )

  return notes
}

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('BottomRightInfo')
const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')

// eslint-disable-next-line react/prop-types
const ProductionWaxEditorLayout = readonly => ({ editor }) => {
  const {
    view: { main },
    options,
  } = useContext(WaxContext)

  // added to bring in notes/comments

  const notes = (main && getNotes(main)) ?? []

  const commentsTracksCount =
    main && DocumentHelpers.getCommentsTracksCount(main)

  const trackBlockNodesCount =
    main && DocumentHelpers.getTrackBlockNodesCount(main)

  const areNotes = notes && !!notes.length && notes.length > 0

  const [hasNotes, setHasNotes] = useState(areNotes)

  const showNotes = () => {
    setHasNotes(areNotes)
  }

  const delayedShowedNotes = useCallback(
    setTimeout(() => showNotes(), 100),
    [],
  )

  useEffect(() => {}, [delayedShowedNotes])

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
              <CommentsContainer>
                <CommentTrackToolsContainer>
                  <CommentTrackTools>
                    {commentsTracksCount + trackBlockNodesCount} COMMENTS AND
                    SUGGESTIONS
                    <CommentTrackOptions>
                      <CommentTrackToolBar />
                    </CommentTrackOptions>
                  </CommentTrackTools>
                </CommentTrackToolsContainer>
                <RightArea area="main" />
              </CommentsContainer>
            </EditorDiv>
            {hasNotes && (
              <NotesAreaContainer>
                <Heading>Notes</Heading>
                <NotesContainer id="notes-container">
                  <NotesArea view={main} />
                </NotesContainer>
                <CommentsContainerNotes>
                  <RightArea area="notes" />
                </CommentsContainerNotes>
              </NotesAreaContainer>
            )}
          </>
        )}
      </Grid>
      {hasNotes && (
        <ReadOnlyNotesAreaContainer>
          <Heading>Notes</Heading>
          <NotesContainer id="notes-container">
            <NotesArea view={main} />
          </NotesContainer>
        </ReadOnlyNotesAreaContainer>
      )}
      <WaxOverlays />
      <InfoContainer>
        <CounterInfo />
      </InfoContainer>
    </div>
  )
}

export default ProductionWaxEditorLayout
