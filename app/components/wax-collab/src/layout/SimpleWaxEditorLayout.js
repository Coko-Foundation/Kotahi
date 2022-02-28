import React from 'react'
import { ComponentPlugin } from 'wax-prosemirror-core'
import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'

const TopBar = ComponentPlugin('topBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const SimpleWaxEditorLayout = readonly => ({ editor }) => (
  <div>
    <SimpleGrid readonly={readonly}>
      {readonly ? (
        <ReadOnlySimpleEditorDiv className="wax-surface-scroll">
          {editor}
        </ReadOnlySimpleEditorDiv>
      ) : (
        <>
          <SimpleMenu>
            <TopBar />
          </SimpleMenu>
          <SimpleEditorDiv className="wax-surface-scroll">
            {editor}
          </SimpleEditorDiv>
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

export default SimpleWaxEditorLayout
