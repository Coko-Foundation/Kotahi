import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Wax /*, CreateSchema */ } from 'wax-prosemirror-core'
// import { XpubSchema } from 'wax-prosemirror-schema'
// import 'wax-prosemirror-themes/themes/default-theme.css'

const options = {
  //  schema: new CreateSchema(XpubSchema),
}

const ManuScript = styled.div`
  .wax-container {
    top: 10%;
    height: 90%;
  }
`

const Info = styled.span`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
`

const Manuscript = ({
  file,
  content,
  currentUser,
  // fileUpload,
  history,
  // updateManuscript,
}) =>
  file &&
  file.mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
    <ManuScript>
      <Wax
        key={1}
        options={options}
        theme="default"
        // fileUpload={fileUpload}
        // onChange={source => updateManuscript({ source })}
        value={content}
      />
    </ManuScript>
  ) : (
    <Info>No supported view of the file</Info>
  )

export default withRouter(Manuscript)
