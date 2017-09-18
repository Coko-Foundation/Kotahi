import React from 'react'
import { FormSection } from 'redux-form'
import { Supplementary, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.scss'

const SupplementaryFiles = ({ uploadFile }) => {
  const FileInput = input =>
    <Supplementary
      uploadFile={uploadFile}
      {...input}/>

  return (
    <FormSection name="files">
      <div className={classes.section} id="files.supplementary">
        <div
          className={classes.label}
          htmlFor="supplementary">Upload supplementary materials
        </div>

        <ValidatedField
          name="supplementary"
          component={FileInput}/>
      </div>
    </FormSection>
  )
}

export default SupplementaryFiles
