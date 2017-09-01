import React from 'react'
import classnames from 'classnames'
import { Link } from 'react-router'
import { Button } from 'xpub-ui'
import Metadata from './Metadata'
import Declarations from './Declarations'
import Suggestions from './Suggestions'
import Notes from './Notes'
import SupplementaryFiles from './SupplementaryFiles'
import Confirm from './Confirm'
import classes from './Submit.local.css'

const Submit = ({ journal, project, version, valid, pristine, submitting, handleSubmit, uploadFile, confirming, toggleConfirming }) => (
  <div className={classnames(classes.root, {
    [classes.confirming]: confirming
  })}>
    <div className={classes.title}>
      Submission information
    </div>

    <div className={classes.intro}>
      <div>We have ingested your manuscript. To access your manuscript in an editor, please <Link to={`/projects/${project.id}/version/${version.id}/manuscript`}>view here</Link>.</div>
      <div>To complete your submission, please answer the following questions.</div>
      <div>The answers will be automatically saved.</div>
    </div>

    <form onSubmit={handleSubmit}>
      <Metadata journal={journal}/>
      <Declarations journal={journal}/>
      <Suggestions/>
      <Notes/>
      <SupplementaryFiles uploadFile={uploadFile}/>

      <div>
        <Button
          type="button"
          onClick={toggleConfirming}
          // disabled={pristine || submitting || !valid}
        >
          Submit your manuscript
        </Button>
      </div>

      {confirming && (
        <div className={classes.confirm}>
          <Confirm toggleConfirming={toggleConfirming}/>
        </div>
      )}
    </form>
  </div>
)

export default Submit
