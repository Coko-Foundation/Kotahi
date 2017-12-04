import React from 'react'
import { withJournal } from 'xpub-journal'

const MetadataSections = ({ journal, sections }) => (
  <span>
    {sections.map((section, index) => [
      index === 0 ? null : <span>{', '}</span>,
      <span>
        {journal.articleSections.find(item => item.value === section).label}
      </span>,
    ])}
  </span>
)

export default withJournal(MetadataSections)
