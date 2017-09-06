import React from 'react'
import { FormSection, Field } from 'redux-form'
import { TextField, ValidatedField } from 'xpub-ui'
import { join, split } from '../lib/validators'
import classes from './Suggestions.local.scss'

const Suggestions = () => (
  <FormSection name="suggestions">
    <div className={classes.section} id="suggestions.reviewers">
      <FormSection name="reviewers">
        <div className={classes.legend}>
          Suggested or opposed reviewers
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Suggested reviewers</div>

          <ValidatedField
            name="suggested"
            format={join()}
            parse={split()}
            component={input =>
              <TextField
                placeholder="Add reviewer names"
                {...input}/>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed reviewers</div>

          <ValidatedField
            name="opposed"
            format={join()}
            parse={split()}
            component={input =>
              <TextField
                placeholder="Add reviewer names"
                {...input}/>
            }/>
        </div>
      </FormSection>
    </div>

    <div className={classes.section} id="suggestions.editors">
      <FormSection name="editors">
        <div className={classes.legend}>
          Suggested or opposed editors
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Suggested editors</div>

          <ValidatedField
            name="suggested"
            format={join()}
            parse={split()}
            component={input =>
              <TextField
                placeholder="Add editor names"
                {...input}/>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed editors</div>

          <ValidatedField
            name="opposed"
            format={join()}
            parse={split()}
            component={input =>
              <TextField
                placeholder="Add editor names"
                {...input}/>
            }/>
        </div>
      </FormSection>
    </div>
  </FormSection>
)

export default Suggestions
