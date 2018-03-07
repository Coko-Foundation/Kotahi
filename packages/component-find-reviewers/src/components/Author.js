import React from 'react'
import classnames from 'classnames'
import { Icon, PlainButton } from '@pubsweet/ui'
import Paper from './Paper'
import classes from './Author.local.scss'
import ProjectLink from './ProjectLink'

const Author = ({ author, toggleAuthor, project, version }) => (
  <div className={classes.root}>
    {author.hidden ? (
      <h3 className={classes.title}>
        <PlainButton
          className={classes.toggle}
          onClick={toggleAuthor('hidden')}
        >
          Show
        </PlainButton>
      </h3>
    ) : (
      <h3 className={classes.title}>
        <ProjectLink
          id={author.id}
          page="find-reviewers/author"
          project={project}
          target="_blank"
          version={version}
        >
          {author.name}
        </ProjectLink>

        {author.flagged && (
          <span className={classes.marker} title="Potential problems!">
            <Icon color="orange">alert_circle</Icon>
          </span>
        )}

        {author.boardMember && (
          <span className={classes.marker} title="Editorial board member">
            <Icon color="green">zap</Icon>
          </span>
        )}

        {!author.assigned && (
          <PlainButton
            className={classnames(classes.toggle, classes.showOnHover)}
            onClick={toggleAuthor('hidden')}
          >
            Hide
          </PlainButton>
        )}

        <PlainButton
          className={classnames(classes.toggle, classes.showOnHover, {
            [classes.assigned]: !!author.assigned,
          })}
          disabled={author.flagged}
          onClick={toggleAuthor('assigned')}
        >
          {author.assigned ? 'Assigned' : 'Assign'}
        </PlainButton>

        <PlainButton
          className={classnames(classes.toggle, classes.showOnHover, {
            [classes.expanded]: !!author.expanded,
          })}
          onClick={toggleAuthor('expanded')}
        >
          {author.expanded ? 'Collapse' : 'Expand'}
        </PlainButton>
      </h3>
    )}

    {author.expanded &&
      !author.hidden && (
        <div className={classes.papers}>
          {author.papers.map(paper => (
            <Paper
              id={paper.id}
              key={paper.id}
              paper={paper}
              project={project}
              version={version}
            />
          ))}
        </div>
      )}
  </div>
)

export default Author
