import React from 'react'
import classnames from 'classnames'
import classes from './ValidatedField.local.scss'
import { Field } from 'redux-form'

// TODO: pass ...props.input to children automatically?

const ValidatedField = ({ component, ...rest }) => (
  <Field
    {...rest}
    component={({ meta, input }) => (
      <div>
        {component(input)}

        <div className={classes.messages}>
          {meta.error && (
            <div className={classnames(classes.message, classes.error)}>
              {meta.error}
            </div>
          )}

          {meta.warning && (
            <div className={classnames(classes.message, classes.warning)}>
              {meta.warning}
            </div>
          )}
        </div>
      </div>
    )}
  />
)

export default ValidatedField
