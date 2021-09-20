import React, { useContext, useEffect, useCallback, useState } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
import { NotesAreaContainer, Heading, NotesContainer } from './NotesStyles'
import {
  Grid,
  Menu,
  EditorDiv,
  EditorContainer,
  InfoContainer,
  ReadOnlyEditorDiv,
} from './EditorStyles'
import { CommentsContainerNotes } from './CommentsStyles'

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CounterInfo = ComponentPlugin('BottomRightInfo')
// const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')

// eslint-disable-next-line react/prop-types
const ProductionWaxEditorNoCommentsLayout = readonly => ({ editor }) => {
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
      </Grid>
      <WaxOverlays />
      <InfoContainer>
        <CounterInfo />
      </InfoContainer>
    </div>
  )
}

export default ProductionWaxEditorNoCommentsLayout
