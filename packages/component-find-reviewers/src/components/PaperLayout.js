import React from 'react'
import classes from './PaperLayout.local.scss'
import { newestFirst } from '../lib/sort'
import Paper from './Paper'
import ProjectLink from './ProjectLink'

const PaperLayout = ({ paper, project, version }) => (
  <div className={classes.root}>
    <h1 className={classes.title}>
      <a href={paper.url} target="_blank">
        {paper.title}
      </a>
    </h1>

    <div className={classes.meta}>
      {paper.year && <span className={classes.year}>{paper.year}</span>}
      {paper.venue && <span className={classes.venue}>{paper.venue}</span>}
    </div>

    <div className={classes.authors}>
      {paper.authors.map((author, i) => (
        <span key={author.authorId || author.name}>
          {!!i && ', '}
          {author.authorId ? (
            <ProjectLink
              id={author.authorId}
              page="find-reviewers/author"
              project={project}
              version={version}
            >
              {author.name}
            </ProjectLink>
          ) : (
            <span>{author.name}</span>
          )}
        </span>
      ))}
    </div>

    <div className={classes.row}>
      <div className={classes.column}>
        {!!paper.citations.length && (
          <div>
            <h2 className={classes.heading}>Cited By</h2>

            {paper.citations
              .sort(newestFirst)
              .map(paper => (
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

        {!!paper.references.length && (
          <div>
            <h2 className={classes.heading}>References</h2>

            {paper.references
              .sort(newestFirst)
              .map(paper => (
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
    </div>
  </div>
)

export default PaperLayout
