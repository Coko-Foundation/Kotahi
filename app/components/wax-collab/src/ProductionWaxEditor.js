import React, { useCallback, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { Wax, WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DefaultSchema, DocumentHelpers } from 'wax-prosemirror-utilities'
import { WaxSelectionPlugin } from 'wax-prosemirror-plugins'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { columnResizing, tableEditing } from 'prosemirror-tables'
import {
  InlineAnnotationsService,
  AnnotationToolGroupService,
  ImageService,
  ImageToolGroupService,
  LinkService,
  ListsService,
  ListToolGroupService,
  TablesService,
  TableToolGroupService,
  BaseService,
  BaseToolGroupService,
  DisplayBlockLevelService,
  DisplayToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  NoteService,
  NoteToolGroupService,
  TrackChangeService,
  CommentsService,
  CodeBlockService,
  CodeBlockToolGroupService,
  DisplayTextToolGroupService,
  MathService,
  FindAndReplaceService,
  EditingSuggestingService,
  TrackingAndEditingToolGroupService,
  FullScreenService,
  FullScreenToolGroupService,
  SpecialCharactersService,
  SpecialCharactersToolGroupService,
  HighlightService,
  TextHighlightToolGroupServices,
  EditorInfoToolGroupServices,
  BottomInfoService,
  TransformService,
  TransformToolGroupService,
  TrackOptionsToolGroupService,
  TrackCommentOptionsToolGroupService,
  CustomTagInlineToolGroupService,
  CustomTagBlockToolGroupService,
  CustomTagService,
} from 'wax-prosemirror-services'
import EditorElements from './EditorElements'
import { KotahiBlockDropDownToolGroupService } from './CustomWaxToolGroups'
import ExtendedHeadingService from './ExtendedHeaders'

import './katex/katex.css'

// this was forked from FullWaxEditor.js

const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const waxConfig = () => ({
  EnableTrackChangeService: false, // This line is needed by NoteService
  SchemaService: DefaultSchema,
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Base',
          exclude: ['Save'],
        },
        'KotahiBlockDropDown',
        {
          name: 'Annotations',
          more: [
            'Superscript',
            'Subscript',
            'SmallCaps',
            'Underline',
            'StrikeThrough',
            'Code',
          ],
        },
        'SpecialCharacters',
        'Lists',
        'Notes',
        'Tables',
        'Images',
        'FullScreen',
      ],
    },
    {
      templateArea: 'commentTrackToolBar',
      toolGroups: ['TrackCommentOptions'],
    },
    {
      templateArea: 'BottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing(), WaxSelectionPlugin],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  TitleService: { updateTitle },
  AcceptTrackChangeService: {
    own: {
      accept: true,
    },
    others: {
      accept: true,
    },
  },
  RejectTrackChangeService: {
    own: {
      reject: true,
    },
    others: {
      reject: true,
    },
  },
  services: [
    new CustomTagService(),
    new DisplayBlockLevelService(),
    new DisplayToolGroupService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
    new ListsService(),
    new LinkService(),
    new InlineAnnotationsService(),
    new TrackChangeService(),
    new CommentsService(),
    new ImageService(),
    new TablesService(),
    new BaseService(),
    new BaseToolGroupService(),
    new NoteService(),
    new TableToolGroupService(),
    new ImageToolGroupService(),
    new AnnotationToolGroupService(),
    new NoteToolGroupService(),
    new ListToolGroupService(),
    new CodeBlockService(),
    new CodeBlockToolGroupService(),
    new EditingSuggestingService(),
    new DisplayTextToolGroupService(),
    new MathService(),
    new FindAndReplaceService(),
    new TrackingAndEditingToolGroupService(),
    new FullScreenService(),
    new FullScreenToolGroupService(),
    new SpecialCharactersService(),
    new SpecialCharactersToolGroupService(),
    new HighlightService(),
    new TextHighlightToolGroupServices(),
    new EditorInfoToolGroupServices(),
    new BottomInfoService(),
    new TransformService(),
    new TransformToolGroupService(),
    new TrackOptionsToolGroupService(),
    new TrackCommentOptionsToolGroupService(),
    new CustomTagInlineToolGroupService(),
    new CustomTagBlockToolGroupService(),
    new ExtendedHeadingService(),
    new KotahiBlockDropDownToolGroupService(),
  ],
})

const user = {
  userId: 'b3cfc28e-0f2e-45b5-b505-e66783d4f946',
  userColor: {
    addition: 'royalblue',
    deletion: 'indianred',
  },
  username: 'admin',
}

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
const WaxLayout = readonly => ({ editor }) => {
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

// TODO Save this image via the server
const renderImage = file => {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    // Some extra delay to make the asynchronicity visible
    setTimeout(() => {
      reader.readAsDataURL(file)
    }, 150)
  })
}

const ProductionWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  onBlur,
  onChange,
  placeholder,
  fileUpload,
  ...rest
}) => {
  const debounceChange = useCallback(debounce(onChange ?? (() => {}), 1000), [])
  return (
    <div className={validationStatus}>
      <Wax
        autoFocus={autoFocus}
        config={waxConfig()}
        fileUpload={file => renderImage(file)}
        layout={WaxLayout(readonly)}
        onBlur={val => {
          onChange && onChange(val)
          onBlur && onBlur(val)
        }}
        onChange={debounceChange}
        placeholder={placeholder}
        readonly={readonly}
        user={user}
        value={value}
        {...rest}
      />
    </div>
  )
}

ProductionWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
}

ProductionWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  onBlur: () => {},
  onChange: () => {},
  placeholder: '',
  fileUpload: () => {},
}

export default ProductionWaxEditor
