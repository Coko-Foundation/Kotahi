import React, { useCallback, useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Wax, WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { DefaultSchema, DocumentHelpers } from 'wax-prosemirror-utilities'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { columnResizing, tableEditing } from 'prosemirror-tables'
import {
  AnnotationToolGroupService,
  BaseService,
  BaseToolGroupService,
  BottomInfoService,
  DisplayToolGroupService,
  EditorInfoToolGroupServices,
  ImageService,
  ImageToolGroupService,
  InlineAnnotationsService,
  LinkService,
  ListsService,
  ListToolGroupService,
  // MathService,
  NoteService,
  NoteToolGroupService,
  SpecialCharactersService,
  SpecialCharactersToolGroupService,
  TablesService,
  TableToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
} from 'wax-prosemirror-services'
import EditorElements from './EditorElements'

const waxConfig = {
  SchemaService: DefaultSchema,
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Base',
          exclude: ['Save'],
        },
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
        'Lists',
        'SpecialCharacters',
        // 'Notes', // TODO: enable once I figure out displaying the NotesContainer
        {
          name: 'Text',
          exclude: [
            'Paragraph',
            'ParagraphContinued',
            'ExtractProse',
            'ExtractPoetry',
            'SourceNote',
          ],
        },
        'Tables',
        'Images',
      ],
    },
    {
      templateArea: 'BottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing()],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  services: [
    new AnnotationToolGroupService(),
    new BaseService(),
    new BaseToolGroupService(),
    new BottomInfoService(),
    new DisplayToolGroupService(),
    new EditorInfoToolGroupServices(),
    new ImageService(),
    new ImageToolGroupService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    // new MathService(),
    new NoteService(),
    new NoteToolGroupService(),
    new SpecialCharactersService(),
    new SpecialCharactersToolGroupService(),
    new TablesService(),
    new TableToolGroupService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
  ],
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
          grid-template-rows: 40px 1fr;
        `}

  position: relative;
  z-index: 0;
`

const EditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  border: 1px solid ${th('colorBorder')};
  border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  border-top: none;
  grid-area: editor;
  overflow: auto;
  padding: 16px;
  position: relative;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
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
  font-size: 80%;
  grid-area: menu;
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 10;
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
  display: flex;
  flex-direction: row;
  height: 100%;
  outline: 3px solid red;
  overflow-y: scroll;
  position: absolute;
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
  height: 100%;
  padding-bottom: ${grid(4)};
  width: 65%;
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
const CounterInfo = ComponentPlugin('BottomRightInfo')

// eslint-disable-next-line react/prop-types
const WaxLayout = readonly => ({ editor }) => {
  const {
    view: { main },
  } = useContext(WaxContext)

  const notes = main && getNotes(main)
  const thereAreNotes = !!notes && !!notes.length
  const [hasNotes, setHasNotes] = useState(thereAreNotes)

  const delayedShowNotes = () =>
    useCallback(
      setTimeout(() => setHasNotes(thereAreNotes), 100),
      [],
    )

  useEffect(() => {}, [delayedShowNotes])

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
          </>
        )}
        {/* TODO Enable once I figure out how to display the NotesContainer */}
        {hasNotes && false && (
          <NotesAreaContainer>
            <NotesContainer id="notes-container">
              <NotesArea view={main} />
            </NotesContainer>
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

const FullWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  placeholder,
  fileUpload,
  ...rest
}) => (
  <div className={validationStatus}>
    <Wax
      autoFocus={autoFocus}
      config={waxConfig}
      fileUpload={file => renderImage(file)}
      layout={WaxLayout(readonly)}
      placeholder={placeholder}
      readonly={readonly}
      value={value}
      {...rest}
    />
  </div>
)

FullWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
  fileUpload: PropTypes.func,
}

FullWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  placeholder: '',
  fileUpload: () => {},
}

export default FullWaxEditor
