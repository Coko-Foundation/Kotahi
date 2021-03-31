/* eslint-disable react/prop-types */

import React from 'react'
import styled, { css } from 'styled-components'
import { ComponentPlugin } from 'wax-prosemirror-core'
import { th, grid } from '@pubsweet/ui-toolkit'
import EditorElements from './EditorElements'

const Layout = styled.div`
  background-color: ${th('colorBackground')};
  border-radius: 0 ${th('borderRadius')} ${th('borderRadius')}
    ${th('borderRadius')};
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
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
`

const Editor = styled.div`
  grid-area: editor;
  overflow: auto;
  padding: 16px;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements};
`

const Menu = styled.div`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid ${th('colorFurniture')};
  border-top-left-radius: ${th('borderRadius')};
  border-top-right-radius: ${th('borderRadius')};
  display: flex;
  grid-area: menu;
  line-height: 40px;
  padding-left: 4px;
  position: sticky;
  top: 0;
  user-select: none;
  z-index: 10;

  /* Hack to hide */
  /* TODO: https://gitlab.coko.foundation/wax/wax-prosemirror/issues/13 */
  button[title='show more tools'] {
    display: none;
  }

  button {
    padding: ${grid(1)};
  }

  div {
    align-items: center;
    display: flex;
    justify-content: center;
  }
`

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
`

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')

const EditoriaLayout = readonly => ({ editor }) => (
  <Container>
    <Layout readonly={readonly}>
      {!readonly && (
        <Menu>
          <TopBar />
        </Menu>
      )}
      <Editor className="wax-surface-scroll">{editor}</Editor>
    </Layout>
    <WaxOverlays />
  </Container>
)

export default EditoriaLayout
