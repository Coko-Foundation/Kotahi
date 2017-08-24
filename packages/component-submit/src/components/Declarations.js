import React from 'react'
import classnames from 'classnames'
import { Field } from 'redux-form'
import { YesOrNo } from 'xpub-ui'
import classes from './Declarations.local.css'

const Declarations = ({ version, handleSubmit, handleChange }) => (
  <form onSubmit={handleSubmit} onChange={handleChange}>
    <div className={classnames(classes.section, classes.spread)}>
      <div className={classes.legend}>
        Data is open
      </div>

      <Field
        name="openData"
        id="openData"
        value={version.openData}
        component={props => <YesOrNo {...props.input}/>}/>
    </div>
  </form>
)

export default Declarations
