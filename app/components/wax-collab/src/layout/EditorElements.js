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
      bottom: 0;
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
    background-color: rgba(25, 25, 112, 0.125);
    border: 1px solid midnightblue;
    margin-bottom: 8px;
    padding: 24px 8px 8px 8px;
    position: relative;

    &:before {
      color: rgba(25, 25, 112, 1);
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

  /* FUNDING SOURCE */

  .fundingsource,
  .fundingstatement,
  .awardid {
    --fundingColorValues: ${th('colorFunding')};
    --fundingOffset: 2px;
    outline: ${th('colorFunding')} 1px solid;
    outline-offset: var(--fundingOffset);
    border-radius: 2px;
    transition: 0.25;
  }

  .fundingsource {
    --fundingColorValues: ${th('colorFundingSource')};
    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }

  .fundingstatement {
    --fundingColorValues: ${th('colorFundingStatement')};
    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }
  .awardid {
    --fundingColorValues: ${th('colorAwardId')};
    &:hover {
      outline-color: var(--fundingColorValues);
    }
  }

  .show-fundingsource .fundingsource {
    outline: var(--fundingColorValues) 2px solid;
  }

  .show-fundingstatement .fundingstatement {
    outline: var(--fundingColorValues) 2px solid;
  }

  .show-awardid .awardid {
    outline: var(--fundingColorValues) 2px solid;
  }

  /* CITATIONS */

  span.mixed-citation {
    --citationColorValues: ${th('colorCitation')};
    --citationTextColor: black;
    --citationOffset: 2px;
    outline: var(--citationColorValues) 1px solid;
    outline-offset: var(--citationOffset);
    position: relative;
    border-radius: 2px;
    transition: 0.25;
    &:hover {
      &:before {
        content: 'Mixed Citation';
        white-space: nowrap;
        position: absolute;
        background-color: var(--citationColorValues);
        color: var(--citationTextColor);
        top: -16px;
        left: 16px;
        padding: 0 4px;
        border-radius: 4px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: none;
      }
    }
  }

  span.article-title,
  span.journal-title,
  span.author-group,
  span.author-name,
  span.volume,
  span.issue,
  span.year,
  span.first-page,
  span.last-page,
  a.doi {
    --citationColorValues: transparent;
    --citationTextColor: black;
    --citationOffset: 2px;
    outline: ${th('colorCitation')} 1px solid;
    outline-offset: var(--citationOffset);
    position: relative;
    border-radius: 2px;
    &:before {
      position: absolute;
      left: -2px;
      top: -2px;
      content: '';
      width: 4px;
      height: 4px;
      background-color: var(--citationColorValues);
      border-radius: 100%;
      display: none;
    }
    &:hover {
      outline-color: var(--citationColorValues);
    }
  }

  span.article-title {
    --citationColorValues: ${th('colorArticleTitle')};
    --citationTextColor: white;
  }

  span.journal-title {
    --citationColorValues: ${th('colorJournalTitle')};
    --citationTextColor: white;
    font-style: italic;
  }

  span.author-group {
    --citationColorValues: ${th('colorAuthorGroup')};
    --citationOffset: 4px;
    --citationTextColor: white;
  }

  span.author-name {
    --citationColorValues: ${th('colorAuthorName')};
    --citationTextColor: white;
  }

  a.doi {
    --citationColorValues: ${th('colorDoi')};
    --citationTextColor: white;
  }

  span.volume {
    --citationColorValues: ${th('colorVolume')};
    --citationTextColor: white;
  }

  span.issue {
    --citationColorValues: ${th('colorIssue')};
    --citationTextColor: white;
  }

  span.first-page {
    --citationColorValues: ${th('colorFirstPage')};
    --citationTextColor: white;
  }

  span.last-page {
    --citationColorValues: ${th('colorLastPage')};
    --citationTextColor: white;
  }

  span.year {
    --citationColorValues: ${th('colorYear')};
    --citationTextColor: white;
  }

  .hide-citation-spans span,
  .hide-citation-spans a {
    --citationColorValues: transparent !important;
    --citationTextColor: transparent !important;
  }

  .show-article-title .article-title {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-journal-title .journal-title {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-author-group .author-group {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-author-name .author-name {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-volume .volume {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-issue .issue {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-year .year {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-first-page .first-page {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-last-page .last-page {
    outline: var(--citationColorValues) 2px solid;
  }

  .show-doi a.doi {
    outline: var(--citationColorValues) 2px solid;
  }

  /* keywords */

  .keyword-list {
    --keywordColorValues: transparent;
    --keywordOffset: 2px;
    outline: ${th('colorKeyword')} 1px solid;
    outline-offset: var(--fundingOffset);
    border-radius: 2px;
    transition: 0.25;
  }

  span.keyword {
    --keywordColorValues: transparent;
    --keywordTextColor: black;
    --keywordOffset: 2px;
    outline: ${th('colorKeyword')} 1px solid;
    outline-offset: var(--keywordOffset);
    position: relative;
    border-radius: 2px;
    font-weight: bold;
    &:before {
      position: absolute;
      left: -2px;
      top: -2px;
      content: '';
      width: 4px;
      height: 4px;
      background-color: var(--keywordColorValues);
      border-radius: 100%;
      display: none;
    }
    // &:hover {
    //   outline-color: var(--keywordColorValues);
    // }
  }

  /* glossary */

  section.glossary {
    background-color: #eee;
    border: 1px solid #ccc;
    margin: 16px 0;
    border-radius: 0 4px 4px 0;
    padding: 4px 8px;
    position: relative;

    &:before {
      background-color: ${th('colorGlossary')};
      border: 1px solid #ccc;
      content: '';
      left: -4px;
      width: 8px;
      position: absolute;
      top: -1px;
      height: calc(100% + 2px);
      border-radius: 4px;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

  .glossary h1,
  .glossary h2,
  .glossary h3,
  .glossary h4,
  .glossary h5,
  .glossary h6 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: bold;
  }

  .glossary-item {
  }

  .glossary-term {
    font-weight: bold;
  }
`

export default EditorStyles
