import React from 'react'
import { FormSection, Field } from 'redux-form'
import { Tags, ValidatedField } from 'xpub-ui'
import classes from './Suggestions.local.css'

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
            component={props =>
              <ValidatedField {...props.meta}>
                <Tags
                  placeholder="Add a reviewer"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed reviewers</div>

          <Field
            name="opposed"
            component={props =>
              <ValidatedField {...props.meta}>
                <Tags
                  placeholder="Add a reviewer"
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
            component={props =>
              <ValidatedField {...props.meta}>
                <Tags
                  placeholder="Add an editor"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>

        <div className={classes.inline}>
          <div className={classes.legend}>Opposed editors</div>

          <Field
            name="opposed"
            component={props =>
              <ValidatedField {...props.meta}>
                <Tags
                  placeholder="Add an editor"
                  {...props.input}/>
              </ValidatedField>
            }/>
        </div>
      </FormSection>
    </div>
  </FormSection>
)

export default Suggestions
