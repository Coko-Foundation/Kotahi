import React from 'react'
import PropTypes from 'prop-types'
import { Wax, ComponentPlugin } from 'wax-prosemirror-core'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { emDash, ellipsis } from 'prosemirror-inputrules'
import { DefaultSchema } from 'wax-prosemirror-utilities'
import {
  AnnotationToolGroupService,
  InlineAnnotationsService,
  LinkService,
  ListsService,
  ListToolGroupService,
  DisplayToolGroupService,
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
    new ListsService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new TextBlockLevelService(),
    new DisplayToolGroupService(),
    new TextToolGroupService(),
    new AnnotationToolGroupService(),
    new ListToolGroupService(),
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
