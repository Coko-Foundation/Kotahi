import React from 'react'
import { Button, PlainButton } from '@pubsweet/ui'
import classes from './Confirm.local.scss'

const Confirm = ({ toggleConfirming }) => (
  <div className={classes.root}>
    <article>
      <h1 className={classes.heading}>
        By submitting the manuscript, you agree to the following statements.
      </h1>

      <p>
        The corresponding author confirms that all co-authors are included, and
        that everyone listed as a co-author agrees to that role and all the
        following requirements and acknowledgements.
      </p>

      <p>
        The submission represents original work and that sources are given
        proper attribution. (The journal employs{' '}
        <a
          href="https://www.crossref.org/services/similarity-check/"
          rel="noopener noreferrer"
          target="_blank"
        >
          CrossCheck
        </a>{' '}
        to compare submissions against a large and growing database of published
        scholarly content. If in the judgment of a senior editor a submission is
        genuinely suspected of plagiarism, it will be returned to the author(s)
        with a request for explanation.)
      </p>

      <p>The research was conducted in accordance with ethical principles.</p>

      <p>
        There is a Data Accessibility Statement, containing information about
        the location of open data and materials, in the manuscript.
      </p>

      <p>
        A conflict of interest statement is present in the manuscript, even if
        to state no conflicts of interest.
      </p>

      <div className={classes.actions}>
        <Button primary type="submit">
          Submit your manuscript
        </Button>
        <span className={classes.actionDivider}> or </span>
        <PlainButton onClick={toggleConfirming}>
          get back to your submission
        </PlainButton>
      </div>
    </article>
  </div>
)

export default Confirm
