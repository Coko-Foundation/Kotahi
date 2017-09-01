import React from 'react'
import classnames from 'classnames'
import classes from './ValidatedField.local.scss'

// TODO: pass ...props.input to children automatically?

const ValidatedField = ({ form, children, error, warning }) => (
  <div>
    {children}

    <div className={classes.messages}>
      {error && (
        <div className={classnames(classes.message, classes.error)}>
          {error}
        </div>
      )}

      {warning && (
        <div className={classnames(classes.message, classes.warning)}>
          {warning}
        </div>
      )}
    </div>
  </div>
)

export default ValidatedField
