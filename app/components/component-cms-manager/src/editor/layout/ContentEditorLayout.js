import React, { useContext } from 'react'
import { WaxContext, ComponentPlugin } from 'wax-prosemirror-core'
import { Grid, EditorDiv, Menu, FullWaxEditorGrid } from '../EditorStyles'

import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const TopBar = ComponentPlugin('topBar')

const ContentEditorLayout = readOnly => ({ editor }) => {
  const { options } = useContext(WaxContext)

  // added to bring in full screen

  let fullScreenStyles = {
    height: '100%',
  }

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
    <div id="wax-container" style={fullScreenStyles}>
      <Grid readonly={readOnly} readOnlyComments>
        <>
          <Menu className="waxmenu">
            <TopBar />
          </Menu>
          <FullWaxEditorGrid
            className="full-wax-editor-grid"
            useComments={false}
          >
            <EditorDiv className="wax-surface-scroll panelWrapper" hideComments>
              {editor}
            </EditorDiv>
          </FullWaxEditorGrid>
        </>
      </Grid>
    </div>
  )
}

export default ContentEditorLayout
