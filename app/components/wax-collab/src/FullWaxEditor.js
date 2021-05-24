import React from 'react'
import PropTypes from 'prop-types'
import { Wax, ComponentPlugin } from 'wax-prosemirror-core'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { columnResizing, tableEditing } from 'prosemirror-tables'
import { DefaultSchema } from 'wax-prosemirror-utilities'
import {
  AnnotationToolGroupService,
  BaseService,
  BaseToolGroupService,
  DisplayToolGroupService,
  InlineAnnotationsService,
  LinkService,
  ListsService,
  ListToolGroupService,
  TablesService,
  TableToolGroupService,
  TextBlockLevelService,
  TextToolGroupService,
  EditorInfoToolGroupServices,
  BottomInfoService,
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
          exclude: ['Code', 'StrikeThrough', 'SmallCaps'],
        },
        'Lists',
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
    new DisplayToolGroupService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new ListToolGroupService(),
    new TablesService(),
    new TableToolGroupService(),
    new TextBlockLevelService(),
    new TextToolGroupService(),
    new EditorInfoToolGroupServices(),
    new BottomInfoService(),
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

  button {
    margin: ${grid(0.25)};
    padding: ${grid(0.05)};
  }

  div {
    align-items: center;
    display: flex;
    justify-content: center;
  }
`

const InfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;
  z-index: 999;
`

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
const CounterInfo = ComponentPlugin('BottomRightInfo')

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
    <InfoContainer>
      <CounterInfo />
    </InfoContainer>
  </div>
)

const FullWaxEditor = ({
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

FullWaxEditor.propTypes = {
  value: PropTypes.string,
  validationStatus: PropTypes.string,
  readonly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  placeholder: PropTypes.string,
}

FullWaxEditor.defaultProps = {
  value: '',
  validationStatus: undefined,
  readonly: false,
  autoFocus: false,
  placeholder: '',
}

export default FullWaxEditor
