import React from 'react'
import Status from '../Status'
import MetadataSections from '../metadata/MetadataSections'
import MetadataReviewType from '../metadata/MetadataReviewType'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataOwners from '../metadata/MetadataOwners'
import ProjectLink from '../ProjectLink'
import AssignEditor from '../AssignEditor'
import { MetadataDivider } from './Dividers'
import classes from './Item.local.scss'

const EditorItem = ({ project, version, addUserToTeam }) => (
  <div className={classes.root}>
    <div className={classes.header}>
      <Status status={project.status}/>

      <div className={classes.meta}>
        <MetadataOwners owners={project.owners}/>
        <MetadataDivider/>
        <MetadataSubmittedDate submitted={version.submitted}/>
        <MetadataDivider/>
        <MetadataSections sections={version.metadata.articleSection}/>
        <MetadataDivider/>
        <MetadataReviewType openReview={version.declarations.openReview}/>
      </div>
    </div>

    <div className={classes.main}>
      <div className={classes.title}>
        {project.title || 'Untitled'}
      </div>

      <div className={classes.links}>
        <div className={classes.link}>
          <ProjectLink
            project={project}
            version={version}
            page="reviewers">Assign Reviewers</ProjectLink>
        </div>
      </div>

      <div className={classes.actions}/>
    </div>

    <div className={classes.roles}>
      <div className={classes.role}>
        {/*<AssignEditor
          project={project}
          teamType="seniorEditor"
          addUserToTeam={addUserToTeam}/>*/}
      </div>
    </div>
  </div>
)

export default EditorItem
