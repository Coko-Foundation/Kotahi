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

          <Field
            name="suggested"
            format={join()}
            parse={split()}
            component={props =>
              <ValidatedField {...props.meta}>
                <TextField
                  placeholder="Add reviewer names"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed reviewers</div>

          <Field
            name="opposed"
            format={join()}
            parse={split()}
            component={props =>
              <ValidatedField {...props.meta}>
                <TextField
                  placeholder="Add reviewer names"
                  {...props.input}/>
              </ValidatedField>
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

          <Field
            name="suggested"
            format={join()}
            parse={split()}
            component={props =>
              <ValidatedField {...props.meta}>
                <TextField
                  placeholder="Add editor names"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed editors</div>

          <Field
            name="opposed"
            format={join()}
            parse={split()}
            component={props =>
              <ValidatedField {...props.meta}>
                <TextField
                  placeholder="Add editor names"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>
      </FormSection>
    </div>
  </FormSection>
)

export default Suggestions
