import React from 'react'
import { FormSection } from 'redux-form'
import { Supplementary, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.scss'

const FileInput = uploadFile => input => (
  <Supplementary uploadFile={uploadFile} {...input} />
)

const SupplementaryFiles = ({ uploadFile, readonly }) => (
  <FormSection name="files">
    <div className={classes.section} id="files.supplementary">
      <div className={classes.label} htmlFor="supplementary">
        Upload supplementary materials
      </div>

      <ValidatedField
        component={FileInput(uploadFile)}
        name="supplementary"
        readonly={readonly}
      />
    </div>
  </FormSection>
)

export default SupplementaryFiles
