import React from 'react'
import { Link } from 'react-router'
import classes from './Submit.local.css'
import Metadata from './Metadata'
import Declarations from './Declarations'
import Suggestions from './Suggestions'
import Notes from './Notes'
import Files from './Files'

const Submit = ({ journal, project, version, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Submission information
    </div>

    <div className={classes.intro}>
      <div>We have ingested your manuscript. To access your manuscript in an editor, please <Link to={`/projects/${project.id}/manuscript`}>view here</Link>.</div>
      <div>To complete your submission, please answer the following questions.</div>
      <div>The answers will be automatically saved.</div>
    </div>

    <form onSubmit={handleSubmit}>
      <Metadata journal={journal}/>
      <Declarations journal={journal}/>
      <Suggestions/>
      <Notes/>
      <Files/>
    </form>
  </div>
)

export default Submit
