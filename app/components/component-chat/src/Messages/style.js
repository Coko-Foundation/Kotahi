/* stylelint-disable property-no-vendor-prefix */

import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

import { HorizontalRule } from '../../../../globals'

export { Spinner } from '../../../shared'
export const Timestamp = styled(HorizontalRule)`
  margin: 24px 0;
  text-align: center;
  user-select: none;

  hr {
    border-color: ${th('colorBorder')};
  }
`

export const UnseenRobotext = styled(Timestamp)`
  hr {
    border-color: ${th('colorWarning')};
    opacity: 0.1;
  }
`

export const Time = styled.span`
  color: ${th('colorText')};
  font-size: 14px;
  font-weight: 500;
  margin: 0 24px;
  text-align: center;
`

export const MessagesGroup = styled.div`
  background: rgb(255, 255, 255);
  -webkit-box-pack: end;
  flex: 1 0 auto;
  flex-direction: column;
  grid-area: read;
  justify-content: flex-end;
  max-width: 100%;
  overflow: hidden auto;
  padding-bottom: 8px;
  width: 100%;
  height: 70%;
  flex-shrink: 1;
`

export const MessageGroupContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  margin-top: 8px;
  position: relative;
`

export const Message = styled.div`
  align-self: stretch;
  background: transparent;
  display: grid;
  grid-template-columns: 72px minmax(0px, 1fr);
  padding-right: 16px;
  position: relative;
`

export const GutterContainer = styled.div`
  display: flex;
  max-width: 72px;
  min-width: 72px;
  padding-left: 16px;
  width: 72px;
`

export const InnerMessageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  padding: 4px 0px;
  position: relative;
`

export const Byline = styled.span`
  align-items: center;
  -webkit-box-align: center;
  color: rgb(36, 41, 46);
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  line-height: 16px;
  margin-bottom: 4px;
  max-width: 100%;
  position: relative;
  user-select: none;
`

export const Bubble = styled.div`
  align-self: flex-start;
  border-radius: 16px;
  clear: both;
  color: rgb(36, 41, 46);
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  font-size: 16px;
  font-weight: 400;
  line-height: ${th('lineHeightBase')};
  overflow-wrap: break-word;
  vertical-align: middle;
  white-space: pre-line;
  width: 100%;
  word-break: break-word;

  /* Classic tags used in Markdown renders (MessageRenderer) */
  pre {
    font-family: ${th('fontCode')};
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }
`

export const EmbedContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  position: relative;
  width: 100%;
`

export const AspectRatio = styled(EmbedContainer)`
  padding-bottom: ${props => (props.ratio ? props.ratio : '0')};
`

export const EmbedComponent = styled.iframe`
  height: 100%;
  position: absolute;
  width: 100%;
`

export const Placeholder = styled.div`
  color: ${th('colorTextPlaceholder')};
  display: grid;
  height: 100%;
  padding: 4em;
  place-items: center;
`
