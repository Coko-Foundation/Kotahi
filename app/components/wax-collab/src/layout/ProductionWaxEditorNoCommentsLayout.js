import React, { useContext, useEffect, useCallback, useState } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
import {
  NotesAreaContainer,
  NotesHeading,
  NotesContainer,
  ReadOnlyNotesAreaContainer,
} from './NotesStyles'
import {
  Grid,
  Menu,
  ProductionEditorDiv,
  EditorContainer,
  InfoContainer,
  ReadOnlyEditorDiv,
  SideMenu,
} from './EditorStyles'
import { CommentsContainerNotes } from './CommentsStyles'

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('bottomRightInfo')
const LeftSideBar = ComponentPlugin('leftSideBar')
// const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')

const ProductionWaxEditorNoCommentsLayout = (readOnly, readOnlyComments) => ({
  editor,
}) => {
  const getNotes = main => {
    const notes = DocumentHelpers.findChildrenByType(
      main.state.doc,
      main.state.schema.nodes.footnote,
      true,
    )

    return notes
  }

  const {
    view: { main },
    options,
  } = useContext(WaxContext)

  const notes = (main && getNotes(main)) ?? []

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
      <Grid production readonly={readOnly} readOnlyComments={readOnlyComments}>
        {readOnly ? (
          <ReadOnlyEditorDiv className="wax-surface-scroll">
            {editor}
          </ReadOnlyEditorDiv>
        ) : (
          <>
            <Menu>
              <TopBar />
            </Menu>
            <ProductionEditorDiv className="wax-surface-scroll">
              <SideMenu>
                <LeftSideBar />
              </SideMenu>
              <EditorContainer>{editor}</EditorContainer>
            </ProductionEditorDiv>
          </>
        )}
        {hasNotes && (
          <NotesAreaContainer>
            <NotesHeading>Notes</NotesHeading>
            <NotesContainer id="notes-container">
              <NotesArea view={main} />
            </NotesContainer>
            <CommentsContainerNotes>
              <RightArea area="notes" />
            </CommentsContainerNotes>
          </NotesAreaContainer>
        )}
      </Grid>
      {readOnly && notes.length > 0 && (
        <ReadOnlyNotesAreaContainer>
          <NotesHeading>Notes</NotesHeading>
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

export default ProductionWaxEditorNoCommentsLayout
