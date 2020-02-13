import React from 'react'
import { JournalContext } from 'xpub-journal'

const MetadataSections = ({ sections }) =>
  sections.length ? (
    <JournalContext.Consumer>
      {journal => (
        <span>
          {sections.length &&
            sections
              .map(section => (
                <span key={section}>
                  {
                    journal.articleSections.find(item => item.value === section)
                      .label
                  }
                </span>
              ))
              .reduce((prev, curr) => [prev, ', ', curr])}
        </span>
      )}
    </JournalContext.Consumer>
  ) : null

export default MetadataSections
