import React from 'react'
import { withJournal } from 'pubsweet-component-xpub-app/src/components'

const MetadataSections = ({ journal, sections }) => (
  <span>
    {sections.map((section, index) => [
      index === 0 ? null : <span>{', '}</span>,
      <span>
        {journal.sections.find(item => item.id === section).label}
      </span>
    ])}
  </span>
)

export default withJournal(MetadataSections)
