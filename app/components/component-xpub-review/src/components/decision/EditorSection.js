import React from 'react'
import { Wax /*, CreateSchema */ } from 'wax-prosemirror-core'
// import { XpubSchema } from 'wax-prosemirror-schema'
// import 'wax-prosemirror-themes/themes/default-theme.css'

import { EditorWrapper } from '../molecules/EditorWrapper'
import { Info } from '../molecules/Info'

const options = {
  // schema: new CreateSchema(XpubSchema),
}

export default ({ manuscript }) =>
  ((manuscript.files || []).find(file => file.fileType === 'manuscript') || '')
    .mimeType ===
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
    <EditorWrapper>
      <Wax
        key={manuscript.id}
        options={options}
        readonly
        theme="default"
        value={manuscript.meta.source}
      />
    </EditorWrapper>
  ) : (
    <Info>No supported view of the file</Info>
  )
