import React, { useContext } from 'react'
import styled from 'styled-components'
import { WaxContext, ComponentPlugin, WaxView } from 'wax-prosemirror-core'
import { Grid, EditorDiv, Menu, FullWaxEditorGrid } from '../EditorStyles'

import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const WaxContainer = styled.div`
  height: 100%;
  position: relative;
`

const TopBar = ComponentPlugin('topBar')

const ContentEditorLayout =
  readOnly =>
  /* eslint-disable-next-line react/function-component-definition */
  props => {
    const { options } = useContext(WaxContext)

    // added to bring in full screen

    let fullScreenStyles = {}

    if (options.fullScreen) {
      fullScreenStyles = {
        backgroundColor: '#fff',
        height: '100%',
        left: '0',
        margin: '0',
        padding: '0',
        position: 'fixed',
        top: '0',
        width: '100%',
        zIndex: '99999',
      }
    }

    return (
      <WaxContainer id="wax-container" style={fullScreenStyles}>
        <Grid readonly={readOnly} readOnlyComments>
          <Menu className="waxmenu">
            <TopBar />
          </Menu>
          <FullWaxEditorGrid
            className="full-wax-editor-grid"
            useComments={false}
          >
            <EditorDiv className="wax-surface-scroll panelWrapper" hideComments>
              <WaxView {...props} />
            </EditorDiv>
          </FullWaxEditorGrid>
        </Grid>
      </WaxContainer>
    )
  }

export default ContentEditorLayout
