import React, { useContext } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DocumentHelpers } from 'wax-prosemirror-utilities'
import {
  Grid,
  FullWaxEditorGrid,
  EditorDiv,
  ReadOnlyEditorWithCommentsEditor,
  Menu,
  InfoContainer,
} from './EditorStyles'
import {
  NotesAreaContainer,
  ReadOnlyNotesAreaContainer,
  NotesContainer,
  NotesHeading,
} from './NotesStyles'
import {
  FullCommentsContainer,
  CommentsContainerNotes,
  CommentTrackToolsContainer,
  CommentTrackTools,
  CommentTrackOptions,
} from './CommentsStyles'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const getNotes = main => {
  const notes = DocumentHelpers.findChildrenByType(
    main.state.doc,
    main.state.schema.nodes.footnote,
    true,
  )

  return notes
}

const TopBar = ComponentPlugin('topBar')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const FullWaxEditorCommentsLayout = (readOnly, authorComments) => ({
  editor,
}) => {
  const {
    pmViews: { main },
    options,
  } = useContext(WaxContext)

  const notes = (main && getNotes(main)) ?? []

  // added to bring in comments

  const commentsTracksCount =
    main && DocumentHelpers.getCommentsTracksCount(main)

  const trackBlockNodesCount =
    main && DocumentHelpers.getTrackBlockNodesCount(main)

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
      {readOnly ? (
        <Grid readonly>
          <FullWaxEditorGrid noScroll useComments>
            <ReadOnlyEditorWithCommentsEditor>
              {editor}
            </ReadOnlyEditorWithCommentsEditor>
            <FullCommentsContainer authorComments={authorComments}>
              <CommentTrackToolsContainer authorComments={authorComments}>
                {authorComments ? null : (
                  <CommentTrackTools>
                    {commentsTracksCount + trackBlockNodesCount} COMMENT
                    {commentsTracksCount + trackBlockNodesCount !== 1
                      ? 'S AND SUGGESTIONS'
                      : ' OR SUGGESTION'}
                    <CommentTrackOptions>
                      <CommentTrackToolBar />
                    </CommentTrackOptions>
                  </CommentTrackTools>
                )}
              </CommentTrackToolsContainer>
              <RightArea area="main" />
            </FullCommentsContainer>
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
        </Grid>
      ) : (
        <Grid>
          <Menu className="waxmenu">
            <TopBar />
          </Menu>
          <FullWaxEditorGrid useComments>
            <EditorDiv className="wax-surface-scroll">{editor}</EditorDiv>
            <FullCommentsContainer>
              <CommentTrackToolsContainer>
                <CommentTrackTools>
                  {commentsTracksCount + trackBlockNodesCount} COMMENT
                  {commentsTracksCount + trackBlockNodesCount !== 1
                    ? 'S AND SUGGESTIONS'
                    : ' OR SUGGESTION'}
                  <CommentTrackOptions>
                    <CommentTrackToolBar />
                  </CommentTrackOptions>
                </CommentTrackTools>
              </CommentTrackToolsContainer>
              <RightArea area="main" />
            </FullCommentsContainer>
            {notes.length > 0 && (
              <>
                <NotesAreaContainer>
                  <NotesContainer id="notes-container">
                    <NotesHeading>Notes</NotesHeading>
                    <NotesArea view={main} />
                  </NotesContainer>
                </NotesAreaContainer>
                <CommentsContainerNotes>
                  <RightArea area="notes" />
                </CommentsContainerNotes>
              </>
            )}
            <InfoContainer>
              <CounterInfo />
            </InfoContainer>
          </FullWaxEditorGrid>
        </Grid>
      )}
    </div>
  )
}

export default FullWaxEditorCommentsLayout
