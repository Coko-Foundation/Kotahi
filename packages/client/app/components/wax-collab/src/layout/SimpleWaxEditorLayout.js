import React from 'react'
import { ComponentPlugin, WaxView } from 'wax-prosemirror-core'
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
  /* eslint-disable-next-line react/function-component-definition */
  props =>
    (
      <>
        <SimpleGrid readonly={readonly}>
          {readonly ? (
            <ReadOnlySimpleEditorDiv
              className="wax-surface-scroll"
              data-testid={dataTestid}
            >
              <WaxView {...props} />
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
                <WaxView {...props} />
              </SimpleEditorDiv>
            </>
          )}
        </SimpleGrid>
        {!readonly && (
          <SimpleInfoContainer>
            <CounterInfo />
          </SimpleInfoContainer>
        )}
      </>
    )

export default SimpleWaxEditorLayout
