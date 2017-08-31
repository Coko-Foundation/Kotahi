import React from 'react'
import { FormSection, Field } from 'redux-form'
import { Files, ValidatedField } from 'xpub-ui'
import classes from './Metadata.local.css'

const SupplementaryFiles = ({ uploadFile }) => (
  <FormSection name="files">
    <div className={classes.section} id="files.supplementary">
      <div
        className={classes.label}
        htmlFor="supplementary">Upload supplementary materials</div>

      <Field
        name="supplementary"
        component={props =>
          <ValidatedField {...props.meta}>
            <Files
              uploadFile={uploadFile}
              {...props.input}/>
          </ValidatedField>
        }/>
    </div>
  </FormSection>
)

export default SupplementaryFiles
