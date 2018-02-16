import styled from 'styled-components'
import Editor from './Editor'

const StyledEditor = styled(Editor).attrs({
  basePlaceholderClassName: 'placeholder',
})`
  font-family: var(--font-writing);
  font-size: var(--font-size-base);
  line-height: 1.8;
  min-height: 1em;
  margin-bottom: var(--grid-unit);

  border: var(--border-width) var(--border-style) var(--color-border);
  border-radius: var(--border-radius);
  padding: calc(var(--grid-unit) / 2);

  &:focus {
    outline: none;
  }

  hr {
    border: none;
    margin: 1em 0;
    padding: 2px 10px;
  }

  hr::after {
    background-color: silver;
    content: '';
    display: block;
    height: 1px;
    line-height: 2px;
  }

  ul,
  ol {
    padding-left: 30px;
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

  th,
  td {
    border: 1px solid #eee;
    padding: 2px 5px;
  }

  .placeholder {
    color: var(--color-text-placeholder);
    font-family: var(--font-interface);
    height: 0;
    pointer-events: none;
  }

  &:focus .placeholder {
    display: none;
  }

  p {
    margin-bottom: 0;
    margin-top: 0;
  }
`

export default StyledEditor
