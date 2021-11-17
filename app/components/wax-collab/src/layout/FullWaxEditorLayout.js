import React, { useContext } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
import {
  Grid,
  EditorDiv,
  ReadOnlyEditorDiv,
  Menu,
  InfoContainer,
  FullWaxEditorGrid,
} from './EditorStyles'
import {
  NotesAreaContainer,
  ReadOnlyNotesAreaContainer,
  NotesContainer,
  NotesHeading,
} from './NotesStyles'

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
const CounterInfo = ComponentPlugin('bottomRightInfo')

const FullWaxEditorLayout = readOnly => ({ editor }) => {
  const {
    view: { main },
    options,
  } = useContext(WaxContext)

  const notes = (main && getNotes(main)) ?? []

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
      <Grid readonly={readOnly} readOnlyComments>
        {readOnly ? (
          <FullWaxEditorGrid useComments={false}>
            <ReadOnlyEditorDiv className="wax-surface-scroll">
              {editor}
            </ReadOnlyEditorDiv>
            {notes.length > 0 && (
              <ReadOnlyNotesAreaContainer>
                <NotesHeading>Notes</NotesHeading>
                <NotesContainer id="notes-container">
                  <NotesArea view={main} />
                </NotesContainer>
              </ReadOnlyNotesAreaContainer>
            )}
            <InfoContainer>
              <CounterInfo />
            </InfoContainer>
          </FullWaxEditorGrid>
        ) : (
          <>
            <Menu>
              <TopBar />
            </Menu>
            <FullWaxEditorGrid useComments={false}>
              <EditorDiv className="wax-surface-scroll" hideComments>
                {editor}
              </EditorDiv>
              {notes.length > 0 && (
                <NotesAreaContainer>
                  <NotesContainer id="notes-container">
                    <NotesHeading>Notes</NotesHeading>
                    <NotesArea view={main} />
                  </NotesContainer>
                </NotesAreaContainer>
              )}
              <InfoContainer>
                <CounterInfo />
              </InfoContainer>
            </FullWaxEditorGrid>
          </>
        )}
      </Grid>
      <WaxOverlays />
    </div>
  )
}

export default FullWaxEditorLayout
