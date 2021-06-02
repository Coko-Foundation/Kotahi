/* stylelint-disable selector-type-no-unknown */
import { css } from 'styled-components'
import { darken, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'

/* All styles regarding ProseMirror surface and elements */

export default css`
  .ProseMirror {
    counter-reset: footnote;
    font-family: ${props => props.theme.fontReading};

    &:focus {
      outline: none;
    }
  }

  .ProseMirror footnote {
    align-items: center;
    background: ${lightenBy('colorPrimary', 0.7)};
    border-radius: ${grid(1)};
    color: ${darken('colorPrimary', 0.5)};
    cursor: pointer;
    display: inline-flex;
    height: ${grid(2)};
    justify-content: center;
    line-height: 0;
    min-width: ${grid(2)};
    vertical-align: top;

    &:hover {
      background: ${lightenBy('colorPrimary', 0.3)};
    }

    ::after {
      content: counter(footnote);
      counter-increment: footnote;
      font-size: ${grid(1.75)};
    }
  }

  h1 {
    font-size: 1em;
    font-weight: 500;
    margin-bottom: 1em;
  }

  p {
    margin-bottom: 1em;
  }

  hr {
    border: none;
    margin: 1em 0;
    padding: 2px 10px;
  }

  hr:after {
    background-color: silver;
    content: '';
    display: block;
    height: 1px;
    line-height: 2px;
  }

  ul,
  ol {
    padding-left: 30px;

    & li p {
      margin-bottom: 0.2em;
    }

    & li:last-child p {
      margin-bottom: 1em;
    }
  }

  u {
    text-decoration: underline;
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  blockquote {
    border-left: 3px solid #eee;
    margin-left: 0;
    margin-right: 0;
    padding-left: 1em;
  }

  img {
    cursor: default;
  }

  sup,
  sub {
    line-height: 0;
  }

  /* Tables */

  table {
    border: 1px solid #eee;
    border-collapse: initial;
    border-spacing: 0;
    border-width: 0 thin thin 0;
    margin: 0;
    overflow: hidden;
    page-break-inside: avoid;
    table-layout: fixed;
    width: 100%;
  }

  th,
  td {
    border: 1px solid #eee;
    box-sizing: border-box;
    /*width: 200px;*/
    padding: 2px 5px;
    position: relative;
    vertical-align: top;
  }

  th {
    background-color: ${lightenBy('colorPrimary', 0.7)};
  }

  .tableWrapper {
    overflow-x: auto;
  }

  .column-resize-handle {
    background-color: #adf;
    bottom: 0;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 4px;
    z-index: 20;
  }

  .ProseMirror.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

  /* Give selected cells a blue overlay */
  .selectedCell:after {
    background: rgba(200, 200, 255, 0.4);
    bottom: 0;
    content: '';
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
  }

  /* placeholder */
  .empty-node::before {
    color: #aaa;
    float: left;
    font-style: italic;
    height: 0;
    pointer-events: none;
  }

  p.empty-node:first-child::before {
    content: attr(data-content);
  }

  /* invisible characters */
  .invisible {
    pointer-events: none;
    user-select: none;
  }

  .invisible:before {
    caret-color: inherit;
    color: gray;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    line-height: 1em;
    width: 0;
  }

  .invisible--space:before {
    content: '·';
  }

  .invisible--break:before {
    content: '¬';
  }

  .invisible--par:after {
    content: '¶';
  }

  span.deletion {
    color: red;
    text-decoration: line-through;
  }

  span.insertion {
    color: blue;
  }

  .selected-insertion,
  .selected-deletion,
  .selected-format-change,
  .selected-block-change {
    background-color: #fffacf;
  }

  .format-change {
    border-bottom: 2px solid blue;
  }

  [data-track] {
    position: relative;
  }

  [data-track]::before {
    border-left: 2px solid blue;
    content: '';
    height: 100%;
    left: -10px;
    position: absolute;
  }

  li[data-track]::before,
  li [data-track]::before {
    left: -5px;
  }

  span.comment {
    border-bottom: 2px solid #ffab20;
    border-radius: 3px 3px 0 0;
  }

  code {
    font-family: monospace;
  }
`
