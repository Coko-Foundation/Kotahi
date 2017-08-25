import React from 'react'
import { FormSection, Field } from 'redux-form'
import { Files } from 'xpub-ui'
import classes from './Metadata.local.css'

const SupplementaryFiles = ({ uploadFile }) => (
  <FormSection name="files">
    <div className={classes.section}>
      <div
        className={classes.label}
        htmlFor="supplementary">Upload supplementary materials</div>

      <Field
        name="supplementary"
        id="supplementary"
        component={props =>
          <Files uploadFile={uploadFile} {...props.input}/>
        }/>
    </div>
  </FormSection>
)

export default SupplementaryFiles
