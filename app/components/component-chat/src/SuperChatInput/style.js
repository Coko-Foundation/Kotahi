import styled, { css } from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

import MentionsInput from '../MentionsInput/MentionsInput'
import { MEDIA_BREAK } from '../../../layout'
import { zIndex } from '../../../../globals'

const theme = {
  text: {
    alt: '#000',
    placeholder: '#000',
    reverse: '#000',
  },
  bg: {
    border: '#000',
  },
  warn: {
    alt: '#000',
  },
  brand: {
    default: '#000',
  },
  special: {
    default: '#000',
    wash: '#000',
  },
}

export const hexa = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  if (alpha >= 0) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return `rgb(${r}, ${g}, ${b})`
}

export const SvgWrapper = styled.div`
  display: inline-block;
  flex: 0 0 ${props => (props.size ? `${props.size}px` : '32px')};
  width: ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  min-width: ${props => (props.size ? `${props.size}px` : '32px')};
  min-height: ${props => (props.size ? `${props.size}px` : '32px')};
  position: relative;
  color: inherit;
  ${props =>
    props.count &&
    css`
      background-color: transparent;
      &:after {
        content: ${props.count ? `'${props.count}'` : `''`};
        position: absolute;
        left: calc(100% - 12px);
        top: -2px;
        font-size: 14px;
        font-weight: 600;
        background: ${theme.bg.default};
        color: ${({ theme }) =>
          process.env.NODE_ENV === 'production'
            ? theme.text.default
            : theme.warn.alt};
        border-radius: 8px;
        padding: 2px 4px;
        border: 2px solid
          ${({ theme }) =>
            process.env.NODE_ENV === 'production'
              ? theme.text.default
              : theme.warn.alt};
      }
    `};
`

export const QuoteWrapper = styled.div`
  border-left: 4px solid ${theme.bg.border};
  color: ${theme.text.alt};
  padding: 4px 12px 4px 16px;
  max-height: ${props => (props.expanded ? 'none' : '7em')};
  margin-top: 4px;
  margin-bottom: 8px;
  overflow-y: hidden;
  cursor: pointer;
  position: relative;
  ${SvgWrapper} {
    margin-left: -3px;
    margin-right: 2px;
  }
`

export const monoStack = css`
  font-family: 'Input Mono', 'Menlo', 'Inconsolata', 'Roboto Mono', monospace;
`

export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const ChatInputContainer = styled(FlexRow)`
  grid-area: write;
  flex: none;
  display: flex;
  flex-direction: column;
  z-index: inherit;
  position: relative;
  width: 100%;
  margin: 0;
  a {
    text-decoration: underline;
  }
`

export const ChatInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  width: 100%;
  margin-bottom: ${th('gridUnit')};
  padding: 8px 12px 0 12px;
  background-color: ${th('colorBackground')};
  // border-top: 1px solid ${th('colorBorder')};
  // box-shadow: -1px 0 0 ${th('colorBorder')}, 1px 0 0 ${th('colorBorder')};
  @media (max-width: ${MEDIA_BREAK}px) {
    bottom: ${props => (props.focus ? '0' : 'auto')};
    position: relative;
    z-index: ${zIndex.mobileInput};
    padding: 8px;
  }
`

export const Form = styled.form`
  flex: auto;
  display: flex;
  min-width: 1px;
  max-width: 100%;
  align-items: center;
  margin-left: 4px;
  border-radius: 24px;
  background-color: transparent;
  position: relative;
`

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: auto;
  padding: ${props => (props.hasAttachment ? '16px' : '9px 16px 8px 16px')};
  transition: padding 0.2s ease-in-out;
  min-height: 40px;
  max-width: calc(100% - 32px);
  border-radius: 24px;
  border: 1px solid
    ${props => (props.networkDisabled ? th('colorWarning') : th('colorBorder'))};
  transition: border 0.3s ease-out;
  color: ${props =>
    props.networkDisabled
      ? th('colorText') // props.theme.special.default
      : th('colorSecondary')}; // props.theme.text.secondary};
  background: ${props =>
    props.networkDisabled
      ? hexa(props.theme.special.default, 0.1)
      : th('colorBackground')};
  &:hover,
  &:focus {
    border-color: ${props =>
      props.networkDisabled
        ? th('borderColor') // props.theme.special.default
        : th('colorWarning')}; // props.theme.text.alt
    transition: border-color 0.2s ease-in;
  }
  @media (max-width: ${MEDIA_BREAK}px) {
    padding-left: 16px;
  }
`

export const Input = styled(MentionsInput).attrs(props => ({
  dataCy: props.dataCy || 'chat-input',
  spellCheck: true,
  autoCapitalize: 'sentences',
  autoComplete: 'on',
  autoCorrect: 'on',
}))`
  font-size: 16px; /* has to be 16px to avoid zoom on iOS */
  font-weight: 400;
  line-height: 1.4;
  background: ${props =>
    props.networkDisabled ? 'none' : th('colorBackground')};
  @media (max-width: ${MEDIA_BREAK}px) {
    font-size: 16px;
  }
  div,
  textarea {
    line-height: 1.4 !important;
    word-break: break-word;
  }
  &::placeholder {
    color: ${props =>
      props.networkDisabled
        ? hexa(th('colorWarning'), 0.8)
        : th('colorSecondary')}; // props.theme.text.placeholder};
  }
  &::-webkit-input-placeholder {
    color: ${props =>
      props.networkDisabled
        ? hexa(th('colorWarning'), 0.8)
        : th('colorSecondary')}; // props.theme.text.placeholder};
  }
  &:-moz-placeholder {
    color: ${props =>
      props.networkDisabled
        ? hexa(th('colorWarning'), 0.8)
        : th('colorSecondary')}; // props.theme.text.placeholder};
  }
  &:-ms-input-placeholder {
    color: ${props =>
      props.networkDisabled
        ? hexa(th('colorWarning'), 0.8)
        : th('colorSecondary')}; // props.theme.text.placeholder};
  }
  pre {
    ${monoStack};
    font-size: 15px;
    font-weight: 500;
    background-color: ${theme.bg.wash};
    border: 1px solid ${th('colorBorder')};
    border-radius: 2px;
    padding: 4px;
    margin-right: 16px;
  }
  blockquote {
    line-height: 1.5;
    border-left: 4px solid ${th('colorBorder')};
    color: ${theme.text.alt};
    padding: 4px 12px 4px 16px;
  }
  ${props =>
    props.hasAttachment &&
    css`
      margin-top: 16px;
      ${'' /* > div:last-of-type {
        margin-right: 32px;
      } */};
    `};
`

export const MediaInput = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
`

export const MediaLabel = styled.label`
  border: none;
  outline: 0;
  display: inline-block;
  background: transparent;
  transition: color 0.3s ease-out;
  border-radius: 4px;
  padding: 4px;
  position: relative;
  top: 2px;
  color: ${theme.text.alt};
  &:hover {
    cursor: pointer;
    color: ${theme.brand.default};
  }
`

export const PhotoSizeError = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  padding: 8px 16px;
  width: 100%;
  background: ${theme.special.wash};
  border-top: 1px solid ${theme.special.border};
  &:hover {
    cursor: pointer;
    p {
      color: ${theme.brand.default};
    }
  }
  p {
    font-size: 14px;
    line-height: 1.4;
    color: ${theme.special.default};
    max-width: calc(100% - 48px);
  }
  div {
    align-self: center;
  }
`

export const RemovePreviewButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  vertical-align: top;
  background-color: ${theme.text.placeholder};
  color: ${theme.text.reverse};
  border: none;
  border-radius: 100%;
  outline: none;
  padding: 4px;
  max-height: 24px;
  max-width: 24px;
  cursor: pointer;
  z-index: 1;
  &:hover {
    background-color: ${theme.warn.alt};
  }
`

export const PreviewWrapper = styled.div`
  position: relative;
  padding: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${th('colorBorder')};
  ${QuoteWrapper} {
    margin: 0;
    margin-top: -6px;
    margin-left: -12px;
    border-left: 0;
  }
  & + & {
    padding-top: 16px;
    ${RemovePreviewButton} {
      top: 16px;
    }
  }
  & > img {
    border-radius: 8px;
    max-width: 37%;
  }
`
