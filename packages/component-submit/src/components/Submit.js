import React from 'react'
import { Link } from 'react-router'
import classes from './Submit.local.css'
import DeclarationsForm from './Declarations'

const Submit = ({ project, version, submitVersion }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Submission information
    </div>

    <div className={classes.intro}>
      <div>We have ingested your manuscript. To access your manuscript in an editor, please <Link to={`/projects/${project.id}/manuscript`}>click here</Link>.</div>
      <div>To complete your submission, please answer the following questions.</div>
      <div>The answers will be automatically saved.</div>
    </div>

    <DeclarationsForm handleSubmit={submitVersion}/>
  </div>
)

export default Submit
