import React from 'react'
import { FormSection } from 'redux-form'
import { Files, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.scss'

const SupplementaryFiles = ({ uploadFile }) => (
  <FormSection name="files">
    <div className={classes.section} id="files.supplementary">
      <div
        className={classes.label}
        htmlFor="supplementary">Upload supplementary materials</div>

      <ValidatedField
        name="supplementary"
        component={input =>
          <Files
            uploadFile={uploadFile}
            {...input}/>
        }/>
    </div>
  </FormSection>
)

export default SupplementaryFiles
