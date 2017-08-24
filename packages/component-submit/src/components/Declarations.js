import React from 'react'
import classnames from 'classnames'
import { FormSection, Field } from 'redux-form'
import { YesOrNo } from 'xpub-ui'
import classes from './Declarations.local.css'

const Declarations = () => (
  <FormSection name="declarations">
    <div className={classnames(classes.section, classes.spread)}>
      <div className={classes.legend}>
        Data is open
      </div>

      <Field
        name="openData"
        id="openData"
        component={props => <YesOrNo {...props.input}/>}/>
    </div>
  </FormSection>
)

export default Declarations
