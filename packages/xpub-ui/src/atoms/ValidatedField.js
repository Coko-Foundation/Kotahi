import React from 'react'
import { compose, withHandlers } from 'recompose'
import classnames from 'classnames'
import { Field } from 'redux-form'
import classes from './ValidatedField.local.scss'

// TODO: pass ...props.input to children automatically?

const ValidatedFieldComponent = ({ component }) => ({ meta, input }) => (
  <div>
    {component(input)}

    {meta.touched &&
      (meta.error || meta.warning) && (
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
      )}
  </div>
)

const ValidatedField = ({ fieldComponent, ...rest }) => (
  <Field {...rest} component={fieldComponent} />
)

export default compose(
  withHandlers({
    fieldComponent: ValidatedFieldComponent,
  }),
)(ValidatedField)
