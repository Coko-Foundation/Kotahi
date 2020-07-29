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
  text-align: center;
  color: ${th('colorText')};
  font-size: 14px;
  font-weight: 500;
  margin: 0 24px;
`

export const MessagesGroup = styled.div`
  padding-bottom: 8px;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  -webkit-box-pack: end;
  justify-content: flex-end;
  flex: 1 0 auto;
  background: rgb(255, 255, 255);
  overflow: hidden auto;
  grid-area: read;
`

export const MessageGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  margin-top: 8px;
  flex: 0 0 auto;
`

export const Message = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0px, 1fr);
  align-self: stretch;
  position: relative;
  padding-right: 16px;
  background: transparent;
`

export const GutterContainer = styled.div`
  display: flex;
  width: 72px;
  min-width: 72px;
  max-width: 72px;
  padding-left: 16px;
`

export const InnerMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1 1 auto;
  padding: 4px 0px;
`

export const Byline = styled.span`
  display: flex;
  font-size: 14px;
  line-height: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  user-select: none;
  color: rgb(36, 41, 46);
  max-width: 100%;
  position: relative;
  flex-wrap: wrap;
  -webkit-box-align: center;
  align-items: center;
`

export const Bubble = styled.div`
  vertical-align: middle;
  white-space: pre-line;
  overflow-wrap: break-word;
  word-break: break-word;
  align-self: flex-start;
  clear: both;
  font-size: 16px;
  line-height: ${th('lineHeightBase')};
  color: rgb(36, 41, 46);
  font-weight: 400;
  display: flex;
  flex-direction: column;
  width: 100%;
  border-radius: 16px;
  flex: 1 1 auto;

  // Classic tags used in Markdown renders (MessageRenderer)
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
  position: relative;
  width: 100%;
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
`

export const AspectRatio = styled(EmbedContainer)`
  padding-bottom: ${props => (props.ratio ? props.ratio : '0')};
`

export const EmbedComponent = styled.iframe`
  position: absolute;
  height: 100%;
  width: 100%;
`

export const Placeholder = styled.div`
  display: grid;
  place-items: center;
  color: ${th('colorTextPlaceholder')};
  height: 100%;
  padding: 4em;
`
