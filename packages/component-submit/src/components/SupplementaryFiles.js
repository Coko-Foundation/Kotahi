import React from 'react'
import { FormSection } from 'redux-form'
import { Supplementary, ValidatedField } from '@pubsweet/ui'
import { Section, Legend } from '../styles'

const FileInput = uploadFile => input => (
  <Supplementary uploadFile={uploadFile} {...input} />
)

const SupplementaryFiles = ({ uploadFile, readonly }) => (
  <FormSection name="files">
    <Section id="files.supplementary">
      <Legend htmlFor="supplementary">Upload supplementary materials</Legend>

      <ValidatedField
        component={FileInput(uploadFile)}
        name="supplementary"
        readonly={readonly}
      />
    </Section>
  </FormSection>
)

export default SupplementaryFiles
