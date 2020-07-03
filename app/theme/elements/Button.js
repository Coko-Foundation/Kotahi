import { css } from 'styled-components'
import { darken, th } from '@pubsweet/ui-toolkit'

const secondary = css`
  background: none;
  border: none;
  color: ${th('colorPrimary')};
  padding: 0;
  text-decoration: underline;

  &:hover,
  &:focus,
  &:active {
    background: none;
    border: none;
    color: ${darken('colorPrimary', 0.3)};
    outline: none;
  }

  &[disabled] {
    color: ${th('colorTextPlaceholder')};
    cursor: default;
    &:hover {
      background: none;
    }
    &:hover:before {
      visibility: hidden;
    }
  }
`

export default css`
  line-height: calc(${th('gridUnit')} * 3);
  min-width: calc(${th('gridUnit')} * 16);
  font-weight: 500;
  ${props => !props.primary && secondary};
  border: none;
`
