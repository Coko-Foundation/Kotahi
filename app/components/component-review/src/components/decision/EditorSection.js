import React from 'react'
import Wax from '../../../../wax-collab/src/Editoria'
// import { XpubSchema } from 'wax-prosemirror-schema'
// import 'wax-prosemirror-themes/themes/default-theme.css'

import { EditorWrapper, Info } from '../style'

// const options = {
//   // schema: new CreateSchema(XpubSchema),
// }

export default ({ manuscript }) =>
  ((manuscript.files || []).find(file => file.fileType === 'manuscript') || '')
    .mimeType ===
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
    <EditorWrapper>
      <Wax
        // fileUpload={fileUpload}
        // onChange={source => updateManuscript({ source })}
        content={manuscript.meta.source}
        readonly
      />
    </EditorWrapper>
  ) : (
    <Info>No supported view of the file</Info>
  )
