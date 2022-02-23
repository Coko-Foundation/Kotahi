import React from 'react'
import { ComponentPlugin } from 'wax-prosemirror-core'
import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'

import ToolbarButton from '../SuperChatInput/ToolbarButton'

const TopBar = ComponentPlugin('topBar')
const WaxOverlays = ComponentPlugin('waxOverlays')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const ChatWaxEditorLayout = readonly => ({ editor }) => {
  const [isTopBarOpen, setIsTopBarOpen] = React.useState(true)

  return (
    <div>
      <SimpleGrid readonly={readonly}>
        {readonly ? (
          <ReadOnlySimpleEditorDiv className='wax-surface-scroll'>
            {editor}
          </ReadOnlySimpleEditorDiv>
        ) : (
          <>
            {isTopBarOpen && (
              <SimpleMenu>
                <TopBar />
              </SimpleMenu>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                marginTop: '24px',
              }}
            >
              <ToolbarButton
                isTopBarOpen={isTopBarOpen}
                onClick={() => setIsTopBarOpen(!isTopBarOpen)}
              />
              <SimpleEditorDiv className='wax-surface-scroll'>
                {editor}
              </SimpleEditorDiv>
            </div>
          </>
        )}
      </SimpleGrid>
      <WaxOverlays />
      {!readonly && (
        <SimpleInfoContainer>
          <CounterInfo />
        </SimpleInfoContainer>
      )}
    </div>
  )
}

export default ChatWaxEditorLayout
