/* stylelint-disable selector-type-no-unknown */
import { css } from 'styled-components'
import { darken, grid, th } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../../shared/lightenBy'

// This should only include styles specific to the editor */
/* Styles that are purely presentational for text should be in textStyles.css */

const EditorStyles = css`
  /* include textStyles here */
  ${props => props.theme.textStyles}

  .ProseMirror {
    counter-reset: footnote;
    font-family: ${props => props.theme.fontReading};
    white-space: pre-wrap;

    &:focus {
      outline: none;
    }
  }

  .ProseMirror footnote {
    align-items: center;
    background: ${lightenBy('colorPrimary', 0.7)};
    border-radius: ${grid(2)};
    color: ${darken('colorPrimary', 0.5)};
    cursor: pointer;
    display: inline-flex;
    height: ${grid(4)};
    justify-content: center;
    line-height: 0;
    min-width: ${grid(4)};
    vertical-align: top;

    &:hover {
      background: ${lightenBy('colorPrimary', 0.3)};
    }

    ::after {
      content: counter(footnote);
      counter-increment: footnote;
      font-size: ${grid(3)};
    }
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

  .insertion .show-insertion {
    color: ${th('colorText')};
  }

  .deletion .hide-deletion {
    display: none;
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
    text-align: center;
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

  /* -- Selection Plugin ---------------------------------- */

  p::selection,
  p > *::selection {
    background-color: #c0c0c0;
  }

  .katex-html *::selection {
    /* stylelint-disable-next-line declaration-no-important */
    background-color: none !important;
  }

  .math-inline.math-select .math-render {
    padding-top: 2px;
  }

  .math-node.math-select .math-render {
    background-color: #c0c0c0ff;
  }

  span[data-type='inline'] {
    display: inline;
    font-weight: 500;
  }

  span[data-type='inline']:before {
    color: #006f19;
    content: ' | ';
    font-weight: 600;
    margin-left: 0;
  }

  span[data-type='inline']:after {
    color: #006f19;
    content: ' | ';
    display: inline;
    font-weight: 600;
  }

  p[data-type='block'] {
    display: block;
    margin-top: 1em;
  }

  p[data-type='block']:before {
    color: #006f19;
    content: '⌜';
    display: inline;
    font-size: 22px;
    font-weight: 600;
    left: 6px;
    position: relative;
    top: 2px;
  }

  p[data-type='block']:after {
    color: #006f19;
    content: '⌟';
    display: inline;
    font-size: 22px;
    font-weight: 600;
    position: relative;
    right: 6px;
    top: 5px;
  }

  .transform-icon {
    transform: rotate(40deg);
  }

  /* JATS */

  section.frontmatter {
    background-color: rgba(255, 0, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'FRONT MATTER';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.abstractSection {
    background-color: rgba(255, 0, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'ABSTRACT';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.reflist {
    background-color: rgba(25, 25, 112, 0.25);
    border: 1px solid midnightblue;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'REFERENCE LIST';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }

    & p {
      &:before {
        content: '§ ';
      }
    }
  }

  h1.referenceheader {
    background-color: midnightblue;
    border-radius: 8px;
    color: white;
    padding: 4px 8px;
  }

  p.reference {
    &:before {
      content: '§ ';
    }
  }

  section.acknowledgementsSection {
    background-color: rgba(255, 255, 0, 0.25);
    border: 1px solid red;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: black;
      content: 'ACKNOWLEDGEMENTS';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  section.appendix {
    background-color: rgba(0, 128, 128, 0.25);
    border: 1px solid teal;
    margin-bottom: 8px;
    padding: 8px 16px;
    position: relative;

    &:before {
      color: white;
      content: 'APPENDIX';
      font-weight: bold;
      left: 2px;
      letter-spacing: 1px;
      position: absolute;
      top: -4px;
    }
  }

  h1.appendixheader {
    background-color: teal;
    border-radius: 8px;
    color: white;
    padding: 4px 8px;
  }

  /* added for figure weirdness */

  figure {
    border: 1px solid ${darken('colorPrimary', 1)};
    margin-bottom: 1rem;
    padding: 1rem;
    position: relative;
  }

  figure::before {
    color: ${darken('colorPrimary', 1)};
    content: 'Figure:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  figure:hover:before {
    content: 'Click to add a caption';
  }

  figcaption {
    border: 1px solid ${darken('colorPrimary', 1)};
    margin-top: 1rem;
    padding: 1rem;
    position: relative;
  }

  figcaption::before {
    color: ${darken('colorPrimary', 1)};
    content: 'Caption:';
    font-size: 75%;
    left: 0;
    letter-spacing: 0.5px;
    position: absolute;
    text-transform: uppercase;
    top: -1.25rem;
  }

  /* CITATIONS */

  span.mixed-citation {
    outline: yellow 1px dotted;
    outline-offset: 6px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Mixed Citation';
        white-space: nowrap;
        position: absolute;
        background-color: yellow;
        color: black;
        top: -16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  span.article-title {
    outline: red 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Article Title';
        white-space: nowrap;
        position: absolute;
        background-color: red;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.journal-title {
    font-style: italic;
    outline: purple 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Journal Title';
        white-space: nowrap;
        position: absolute;
        background-color: purple;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.author-group {
    outline: blue 1px dotted;
    outline-offset: 4px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Author Group';
        white-space: nowrap;
        position: absolute;
        background-color: blue;
        color: white;
        top: -16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  span.author-name {
    outline: blue 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Author Name';
        white-space: nowrap;
        position: absolute;
        background-color: blue;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  a.doi {
    outline: green 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'DOI';
        white-space: nowrap;
        position: absolute;
        background-color: green;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.volume {
    outline: orange 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Volume';
        white-space: nowrap;
        position: absolute;
        background-color: orange;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.issue {
    outline: magenta 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Issue';
        white-space: nowrap;
        position: absolute;
        background-color: magenta;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.first-page {
    outline: lime 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'First Page';
        white-space: nowrap;
        position: absolute;
        background-color: lime;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.last-page {
    outline: cyan 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Last Page';
        white-space: nowrap;
        position: absolute;
        background-color: cyan;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  span.year {
    outline: gray 1px dotted;
    outline-offset: 2px;
    position: relative;
    border-radius: 2px;
    &:hover {
      &:before {
        content: 'Year';
        white-space: nowrap;
        position: absolute;
        background-color: gray;
        color: white;
        top: 16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        font-style: normal;
        letter-spacing: 0.5px;
        z-index: 999;
      }
    }
  }

  .hide-citation-spans .citation-span {
    outline: none;
    &:hover {
      &:before {
        display: none;
      }
    }
  }
`

export default EditorStyles
