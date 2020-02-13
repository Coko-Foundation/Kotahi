import React from 'react'
import { Attachment } from '@pubsweet/ui'
import { Section, Legend } from '../styles'

const SupplementaryFiles = ({ manuscript }) => (
  <Section id="files.supplementary">
    {(manuscript.files || []).filter(file => file.type === 'supplementary')
      .length > 0
      ? [
          <Legend htmlFor="supplementary">
            Supplementary materials uploaded
          </Legend>,
          <div>
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
