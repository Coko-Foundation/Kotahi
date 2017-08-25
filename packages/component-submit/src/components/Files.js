import React from 'react'
import { FormSection, Field } from 'redux-form'
import classes from './Metadata.local.css'

const Files = () => (
  <FormSection name="files">
    <div className={classes.section}>
      <div
        className={classes.label}
        htmlFor="supplementary">Upload supplementary materials</div>

      <Field
        name="supplementary"
        id="supplementary"
        component={props =>
          <div>TODO</div>
        }/>
    </div>
  </FormSection>
)

export default Files
