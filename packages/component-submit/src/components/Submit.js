import React from 'react'
import { Link } from 'react-router'
import classes from './Submit.local.css'
import Metadata from './Metadata'
import Declarations from './Declarations'

const Submit = ({ journal, project, version, updateVersion, submitVersion }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Submission information
    </div>

    <div className={classes.intro}>
      <div>We have ingested your manuscript. To access your manuscript in an editor, please <Link to={`/projects/${project.id}/manuscript`}>view here</Link>.</div>
      <div>To complete your submission, please answer the following questions.</div>
      <div>The answers will be automatically saved.</div>
    </div>

    <Metadata
      journal={journal}
      handleChange={updateVersion}/>

    <Declarations
      handleChange={updateVersion}/>
  </div>
)

export default Submit
