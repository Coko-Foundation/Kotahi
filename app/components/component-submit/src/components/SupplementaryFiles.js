import React from 'react'
import { Attachment } from '@pubsweet/ui'
import { Section, Legend } from '../style'

const SupplementaryFiles = ({ manuscript }) => (
  <Section id="files.supplementary">
    {(manuscript.files || []).filter(file => file.type === 'supplementary')
      .length > 0
      ? [
          <Legend htmlFor="supplementary" key={1}>
            Supplementary materials uploaded
          </Legend>,
          <div key={2}>
            {manuscript.files
              .filter(file => file.type === 'supplementary')
              .map(attachment => (
                <Attachment file={attachment} key={attachment.url} uploaded />
              ))}
          </div>,
        ]
      : null}
  </Section>
)

export default SupplementaryFiles
