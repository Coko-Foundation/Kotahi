import React from 'react'
import { Button } from '@pubsweet/ui'
import classes from './AuthorLayout.local.scss'
import Paper from './Paper'
import { publicationYears } from '../lib/author'

const AuthorLayout = ({ author, assignReviewer, project, version }) => (
  <div className={classes.root}>
    <h1 className={classes.title}>
      {author && (
        <a href={author.url} target="_blank">
          {author.name}
        </a>
      )}
    </h1>

    <div className={classes.meta}>
      <div className={classes.email}>{author.email}</div>

      <div className={classes.affiliation}>{author.affiliation}</div>

      <div className={classes.history}>
        {publicationYears(author.papers).map(item => (
          <span
            className={classes.year}
            key={item.year}
            style={{ fontSize: item.size }}
          >
            {item.year}
          </span>
        ))}
      </div>

      <div>
        <Button onClick={assignReviewer}>Assign</Button>
      </div>
    </div>

    <div className={classes.row}>
      <div className={classes.column}>
        {!!author.papers.length && (
          <div>
            <h2 className={classes.heading}>Papers</h2>

            {author.papers.map(paper => (
              <Paper
                id={paper.paperId}
                key={paper.paperId}
                paper={paper}
                project={project}
                version={version}
              />
            ))}
          </div>
        )}
      </div>

      <div className={classes.column} />
    </div>
  </div>
)

export default AuthorLayout
