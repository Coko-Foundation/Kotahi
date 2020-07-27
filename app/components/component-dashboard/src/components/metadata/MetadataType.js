import React from 'react'
import { JournalContext } from '../../../../xpub-journal/src'

const MetadataType = ({ journal, type }) => (
  <JournalContext.Consumer>
    {journal => (
      <span>
        {(journal.articleTypes.find(item => item.value === type) || {}).label ||
          'None'}
      </span>
    )}
  </JournalContext.Consumer>
)

export default MetadataType
