import React from 'react'
import { ComponentPlugin } from 'wax-prosemirror-core'
import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

import ToolbarButton from '../SuperChatInput/ToolbarButton'

const TopBar = ComponentPlugin('topBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const ChatWaxEditorLayout =
  readonly =>
  /* eslint-disable-next-line react/function-component-definition */
  ({ editor }) => {
    const [isTopBarOpen, setIsTopBarOpen] = React.useState(false)

    return (
      <div>
        <SimpleGrid readonly={readonly}>
          {readonly ? (
            <ReadOnlySimpleEditorDiv className="wax-surface-scroll">
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
                }}
              >
                <ToolbarButton
                  isTopBarOpen={isTopBarOpen}
                  onClick={() => setIsTopBarOpen(!isTopBarOpen)}
                />
                <SimpleEditorDiv className="wax-surface-scroll">
                  {editor}
                </SimpleEditorDiv>
              </div>
            </>
          )}
        </SimpleGrid>
        {!readonly && (
          <SimpleInfoContainer>
            <CounterInfo />
          </SimpleInfoContainer>
        )}
      </div>
    )
  }

export default ChatWaxEditorLayout
