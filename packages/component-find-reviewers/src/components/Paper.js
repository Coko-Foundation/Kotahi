import React from 'react'
import classes from './Paper.local.scss'
import ProjectLink from './ProjectLink'

const Paper = ({ id, paper, project, version }) => (
  <div className={classes.root}>
    {paper.scorePercent && (
      <div className={classes.score}>
        <span
          className={classes.scoreIndicator}
          style={{ right: `${100 - paper.scorePercent}%` }}
        />
      </div>
    )}

    <div className={classes.main}>
      {paper.year && <div className={classes.year}>{paper.year}</div>}

      <div className={classes.title}>
        <ProjectLink
          id={id}
          page="find-reviewers/paper"
          project={project}
          version={version}
        >
          {paper.title}
        </ProjectLink>
      </div>
    </div>
  </div>
)

export default Paper
