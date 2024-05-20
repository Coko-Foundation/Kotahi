import React, { useContext } from 'react'
import styled from 'styled-components'
import {
  WaxContext,
  ComponentPlugin,
  DocumentHelpers,
} from 'wax-prosemirror-core'
import {
  Grid,
  FullWaxEditorGrid,
  EditorDiv,
  ReadOnlyEditorWithCommentsEditor,
  Menu,
  InfoContainer,
  EditorArea,
  EditorContainer,
  WaxSurfaceScroll,
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

const EditorWrapper = styled.div`
  &.fullscreen {
    background-color: #fff;
    height: 100%;
    left: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 99999;

    & > div {
      display: block; /* this turns off grid for full screen and allows for scrolling */

      & > div + div {
        max-height: calc(100vh - 38px);
        overflow-y: scroll;
        position: fixed;
        top: 38px;
        width: 100%;
      }
    }
  }
`

const TopBar = ComponentPlugin('topBar')
const NotesArea = ComponentPlugin('notesArea')
const RightArea = ComponentPlugin('rightArea')
const CommentTrackToolBar = ComponentPlugin('commentTrackToolBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const FullWaxEditorCommentsLayout =
  (readOnly, authorComments) =>
  /* eslint-disable-next-line react/function-component-definition */
  ({ editor }) => {
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
      <EditorWrapper
        className={options.fullScreen ? 'fullscreen' : ''}
        id="wax-container"
      >
        <div style={fullScreenStyles}>
          <Grid fullHeight readOnly={readOnly}>
            {readOnly ? (
              <FullWaxEditorGrid noScroll useComments>
                <ReadOnlyEditorWithCommentsEditor className="panelWrapper">
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
                  <ReadOnlyNotesAreaContainer className="panelWrapper">
                    <NotesContainer id="notes-container">
                      <NotesHeading>Notes</NotesHeading>
                      <NotesArea view={main} />
                    </NotesContainer>
                  </ReadOnlyNotesAreaContainer>
                )}
              </FullWaxEditorGrid>
            ) : (
              <>
                <Menu className="waxmenu">
                  <TopBar />
                </Menu>
                <EditorDiv className="wax-surface-scroll panelWrapper">
                  <EditorArea className="editorArea">
                    <div>
                      <WaxSurfaceScroll className="panelWrapper">
                        <EditorContainer>{editor}</EditorContainer>
                        <FullCommentsContainer>
                          <CommentTrackToolsContainer>
                            <CommentTrackTools>
                              {commentsTracksCount + trackBlockNodesCount}{' '}
                              COMMENT
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
                      </WaxSurfaceScroll>
                      {notes.length > 0 && (
                        <>
                          <NotesAreaContainer className="panelWrapper">
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
                    </div>
                  </EditorArea>
                </EditorDiv>
              </>
            )}
          </Grid>
          <InfoContainer>
            <CounterInfo />
          </InfoContainer>
        </div>
      </EditorWrapper>
    )
  }

export default FullWaxEditorCommentsLayout
