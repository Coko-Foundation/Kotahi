/* eslint-disable react/prop-types */

import React from 'react'

const MetadataAuthors = ({ authors }) =>
  authors.length ? (
    <span>
      {authors
        .map(author => (
          <span key={(author.user || {}).username || 'Anonymous'}>
            {(author.user || {}).username || 'Anonymous'}
          </span>
        ))
        .reduce((prev, curr) => [prev, ', ', curr])}
    </span>
  ) : null

export default MetadataAuthors
