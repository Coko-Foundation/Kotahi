/* stylelint-disable property-no-vendor-prefix */

import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'

export { Spinner } from '../../../shared'

export const Time = styled.span`
  color: ${th('colorText')};
  font-size: 14px;
  font-weight: 500;
  margin: 0 24px;
  text-align: center;
`

export const InlineTime = styled.span`
  color: ${th('colorText')};
  font-size: 14px;
  font-weight: 300;
  margin: 0 24px;
  text-align: center;
`

export const MessagesGroup = styled.div`
  background: rgb(255, 255, 255);
  -webkit-box-pack: end;
  flex: 1 0 auto;
  flex-direction: column;
  flex-shrink: 1;
  grid-area: read;
  height: 0px;
  justify-content: flex-end;
  max-width: 100%;
  overflow: hidden auto;
  width: 100%;
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
  grid-template-columns: 45px auto;
  padding-right: 4px;
  position: relative;

  .message-timestamp {
    opacity: 0;
  }

  &:hover {
    background-color: #f8f8f9;

    .ProseMirror {
      background: none;
    }

    .message-timestamp {
      opacity: 1;
    }
  }
`

export const GutterContainer = styled.div`
  display: flex;
  padding-left: 8px;
  width: 45px;
`

export const InnerMessageContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  padding: 4px 0px;
  position: relative;

  &:hover {
    background-color: #f8f8f9;
  }
`

export const Byline = styled.span`
  align-items: center;
  -webkit-box-align: center;
  color: rgb(36, 41, 46);
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 500;
  justify-content: space-between;
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
  font-size: 16px;
  font-weight: 400;
  justify-content: space-between;
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

  > div {
    flex: 1;
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

const ChatLabelContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 50px 0 35px;
  position: relative;
`

const ChatLabel = styled.div`
  border-radius: 4px;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  padding: 2px 20px;
  position: absolute;
  top: -11px;
`

export const UnreadLabelContainer = styled(ChatLabelContainer)`
  border-top: 2px solid #5dab41;
`
export const UnreadLabel = styled(ChatLabel)`
  background-color: #5dab41;
  color: #ffffff;
`

export const DateLabelContainer = styled(ChatLabelContainer)`
  border-top: 2px solid #6c6c6c;
  margin: 40px 0 30px;
`
export const DateLabel = styled(ChatLabel)`
  background-color: #ffffff;
  color: #6c6c6c;
  padding: 2px 12px;
`
