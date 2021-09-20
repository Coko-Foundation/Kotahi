import React, { useContext } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
import {
  Grid,
  EditorDiv,
  ReadOnlyEditorDiv,
  Menu,
  InfoContainer,
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

// eslint-disable-next-line react/prop-types
const FullWaxEditorCommentsLayout = readonly => ({ editor }) => {
  const {
    view: { main },
  } = useContext(WaxContext)

  const TopBar = ComponentPlugin('topBar')
  const WaxOverlays = ComponentPlugin('waxOverlays')
  const NotesArea = ComponentPlugin('notesArea')
  const CounterInfo = ComponentPlugin('BottomRightInfo')

  const notes = (main && getNotes(main)) ?? []

  return (
    <div>
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
            <EditorDiv className="wax-surface-scroll">{editor}</EditorDiv>
            {notes.length > 0 && (
              <NotesAreaContainer>
                <NotesHeading>Notes</NotesHeading>
                <NotesContainer id="notes-container">
                  <NotesArea view={main} />
                </NotesContainer>
              </NotesAreaContainer>
            )}
          </>
        )}
      </Grid>
      {readonly && notes.length > 0 && (
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

export default FullWaxEditorCommentsLayout
