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

const TopBar = ComponentPlugin('topBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

// eslint-disable-next-line react/prop-types
const SimpleWaxEditorLayout =
  (readonly, dataTestid = null) =>
  ({ editor }) =>
    (
      <div>
        <SimpleGrid readonly={readonly}>
          {readonly ? (
            <ReadOnlySimpleEditorDiv
              className="wax-surface-scroll"
              data-testid={dataTestid}
            >
              {editor}
            </ReadOnlySimpleEditorDiv>
          ) : (
            <>
              <SimpleMenu>
                <TopBar />
              </SimpleMenu>
              <SimpleEditorDiv
                className="wax-surface-scroll"
                data-testid={dataTestid}
              >
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
