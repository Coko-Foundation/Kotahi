import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import EditorElements from './EditorElements'

export const Grid = styled.div`
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

  /* This was killing the comment visibility */
  /* :focus-within {
    z-index: 10000;
  } */
`

export const SimpleGrid = styled.div`
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
`

export const ProductionEditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  border: 1px solid ${th('colorBorder')};
  border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  border-top: none;
  box-sizing: border-box;
  display: flex;
  grid-area: editor;
  height: 100%;
  min-height: 500px;
  overflow: auto;
  padding: 16px;
  position: relative;
  width: 100%;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const ReadOnlyEditorWithCommentsWrapper = styled.div`
  display: flex;
  grid-area: editor;
  height: 100%;
`

export const ReadOnlyEditorWithCommentsEditor = styled.div`
  height: 100%;
  min-width: 800px;
  width: 100%;
  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const EditorDiv = styled.div`
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

export const SimpleEditorDiv = styled.div`
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

export const EditorContainer = styled.div`
  height: 100%;
  width: 100%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;

    & .comment {
      border-bottom-color: transparent;
    }
  }
`

export const FullEditorContainer = styled.div`
  height: 100%;
  min-width: 800px;
  width: 100%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;

    & .comment {
      border-bottom-color: transparent;
    }
  }
`

export const ReadOnlyEditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  grid-area: editor;
  overflow: auto;
  padding: 16px;
  position: relative;

  & .ProseMirror .comment {
    border-bottom-color: transparent;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const ReadOnlySimpleEditorDiv = styled.div`
  grid-area: editor;
  overflow: auto;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const Menu = styled.div`
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

export const SimpleMenu = styled.div`
  align-items: center;
  background: #fff;
  border-bottom: 1px solid ${th('colorFurniture')};
  display: flex;
  flex-wrap: wrap;
  grid-area: menu;
  height: fit-content;
  margin: 0 ${th('borderRadius')};
  max-width: 100%; /* this is to avoid spillover */
  /* overflow-x: scroll; this is not great! */
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 1;

  & > div {
    height: 36px;
  }

  :focus-within {
    z-index: 1000;
  }
`

export const InfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;
  z-index: 999;
`

export const SimpleInfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;

  div:focus-within > & {
    z-index: 1000;
  }
`
