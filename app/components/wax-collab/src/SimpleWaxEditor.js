import React from 'react'
import PropTypes from 'prop-types'
import { Wax, ComponentPlugin } from 'wax-prosemirror-core'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { DefaultSchema } from 'wax-prosemirror-utilities'
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
          name: 'Annotations',
          exclude: ['Code', 'StrikeThrough', 'Underline', 'SmallCaps'],
        },
        {
          name: 'Lists',
        },
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
      ],
    },
  ],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  services: [
    // TODO: A Wax bug causes two editors with different services loaded to mess each other up. Workaround: load all services used by FullWaxEditor.
    new AnnotationToolGroupService(),
    new BaseService(), // TODO remove once Wax is fixed
    new BaseToolGroupService(), // TODO remove once Wax is fixed
    new BottomInfoService(), // TODO remove once Wax is fixed
    new DisplayToolGroupService(),
    new EditorInfoToolGroupServices(), // TODO remove once Wax is fixed
    new ImageService(), // TODO remove once Wax is fixed
    new ImageToolGroupService(), // TODO remove once Wax is fixed
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    // new MathService(),
    new NoteService(),
    new NoteToolGroupService(),
    new SpecialCharactersService(), // TODO remove once Wax is fixed
    new SpecialCharactersToolGroupService(), // TODO remove once Wax is fixed
    new TablesService(), // TODO remove once Wax is fixed
    new TableToolGroupService(), // TODO remove once Wax is fixed
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
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
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
  grid-area: editor;
  overflow: auto;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

const Menu = styled.div`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid ${th('colorFurniture')};
  display: flex;
  grid-area: menu;
  margin: 0 ${th('borderRadius')};
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 10;

  button {
    padding: ${grid(0.25)};
  }

  div {
    align-items: center;
    display: flex;
    justify-content: center;
  }
`

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')

// eslint-disable-next-line react/prop-types
const WaxLayout = readonly => ({ editor }) => (
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
    </Grid>
    <WaxOverlays />
  </div>
)

const SimpleWaxEditor = ({
  value,
  validationStatus,
  readonly,
  autoFocus,
  placeholder,
  ...rest
}) => (
  <div className={validationStatus}>
    <Wax
      autoFocus={autoFocus}
      config={waxConfig}
      // fileUpload={file => renderImage(file)}
      layout={WaxLayout(readonly)}
      placeholder={placeholder}
      readonly={readonly}
      value={value}
      {...rest}
    />
  </div>
)

SimpleWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
}

SimpleWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  placeholder: '',
}

export default SimpleWaxEditor
