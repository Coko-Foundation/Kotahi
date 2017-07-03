import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'

import './Upload.css'

const Upload = ({ ink, onDrop }) => (
  <Dropzone onDrop={onDrop} accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="dropzone">
    <div className="content-interactive" style={{ fontWeight: 200, display: 'flex', paddingTop: 10, paddingBottom: 10 }}>
      <div>
        <span className={`fa fa-fw fa-4x ${ink.isFetching ? 'fa-spinner fa-spin' : 'fa-plus-circle'}`} style={{ color: '#4990E2' }}/>
      </div>

      <div style={{ flex: 1, paddingTop: 10, paddingRight: 10 }}>
        <div style={{ textTransform: 'uppercase', fontSize: '200%', color: '#4990E2' }}>Submit a new manuscript</div>

        <div style={{ fontSize: '75%', color: '#aaa', lineHeight: 1, marginTop: 5 }}>upload a new Word docx file into xpub to start the submission process</div>
      </div>
    </div>
  </Dropzone>
)

Upload.propTypes = {
  onDrop: PropTypes.func.isRequired,
  ink: PropTypes.object.isRequired
}

export default Upload
