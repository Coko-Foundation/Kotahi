import React from 'react'
import { FormSection } from 'redux-form'
import { Supplementary, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.scss'

const FileInput = uploadFile => input =>
  <Supplementary
    uploadFile={uploadFile}
    {...input}/>

const SupplementaryFiles = ({ uploadFile }) => (
  <FormSection name="files">
    <div className={classes.section} id="files.supplementary">
      <div
        className={classes.label}
        htmlFor="supplementary">Upload supplementary materials
      </div>

      <ValidatedField
        name="supplementary"
        component={FileInput(uploadFile)}/>
    </div>
  </FormSection>
)

export default SupplementaryFiles
