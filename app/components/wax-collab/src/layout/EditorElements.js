/* stylelint-disable selector-type-no-unknown */
import { css } from 'styled-components'
import { darken, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../../shared/lightenBy'

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
    font-size: 1.75em;
    font-weight: 500;
    margin: 1em 0;
  }

  h2 {
    font-size: 1.625em;
    font-weight: 500;
    margin: 1em 0;
  }

  h3 {
    font-size: 1.5em;
    font-weight: 500;
    margin: 1em 0;
  }

  h4 {
    font-size: 1.375em;
    font-weight: 500;
    margin: 1em 0;
  }

  h5 {
    font-size: 1.25em;
    font-weight: 500;
    margin: 1em 0;
  }

  h6 {
    font-size: 1.125em;
    font-weight: 500;
    margin: 1em 0;
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
    max-width: 100%;
    object-fit: scale-down;
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

  .small-caps {
    font-variant: small-caps;
  }

  a {
    color: blue;
  }

  /* == Math Nodes ======================================== */

  .math-node {
    cursor: auto;
    font-family: 'Consolas', 'Ubuntu Mono', monospace;
    font-size: 0.95em;
    min-height: 1em;
    min-width: 1em;

    .ProseMirror {
      background: #eee;
      box-shadow: none;
      color: rgb(132, 33, 162);
      min-height: 100%;
      padding: 0;
    }
  }

  .math-node.empty-math .math-render::before {
    color: red;
    content: '(empty)';
  }

  .math-node .math-render.parse-error::before {
    color: red;
    content: '(math error)';
    cursor: help;
  }

  /* -- Inline Math --------------------------------------- */

  math-inline {
    display: inline;
    white-space: nowrap;
  }

  math-inline .math-render {
    cursor: pointer;
    display: inline-block;
    font-size: 0.85em;
  }

  math-inline .math-src .ProseMirror {
    display: inline;
  }

  math-inline .math-src::after,
  math-inline .math-src::before {
    color: #b0b0b0;
    content: '$';
  }

  /* -- Block Math ---------------------------------------- */

  math-display {
    display: block;
  }

  math-display .math-render {
    display: block;
  }

  math-display.ProseMirror-selectednode {
    background-color: #eee;
  }

  math-display .math-src .ProseMirror {
    display: block;
    width: 100%;
  }

  math-display .math-src::after,
  math-display .math-src::before {
    color: #b0b0b0;
    content: '$$';
    text-align: left;
  }

  math-display .katex-display {
    margin: 0;
  }

  /* -- Other Math ---------------------------------------- */

  .math-node.ProseMirror-selectednode {
    outline: none;
  }

  .math-node .math-src {
    color: rgb(132, 33, 162);
    display: none;
    tab-size: 4;
  }

  .math-node.ProseMirror-selectednode .math-src {
    display: flex;
  }

  .math-node.ProseMirror-selectednode .math-render {
    display: none;
  }
`
