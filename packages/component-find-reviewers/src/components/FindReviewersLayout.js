import React from 'react'
import Author from './Author'
import Paper from './Paper'
import Metadata from './Metadata'
import classes from './FindReviewersLayout.local.scss'

const FindReviewersLayout = ({
  authors,
  papers,
  project,
  version,
  error,
  toggleAuthor,
}) => (
  <div className={classes.root}>
    <Metadata version={version} />

    {error && <div>{error}</div>}

    {authors ? (
      <div className={classes.row}>
        <div className={classes.column}>
          <h2 className={classes.heading}>Similar Papers</h2>
          {papers.map(paper => (
            <Paper
              id={paper.id}
              key={paper.id}
              paper={paper}
              project={project}
              version={version}
            />
          ))}
        </div>

        <div className={classes.column}>
          <h2 className={classes.heading}>Suggested Reviewers</h2>

          {authors.map(author => (
            <Author
              author={author}
              key={author.id}
              project={project}
              toggleAuthor={toggleAuthor(author.id)}
              version={version}
            />
          ))}
        </div>
      </div>
    ) : (
      <div>Searching for reviewers…</div>
    )}
  </div>
)

export default FindReviewersLayout
