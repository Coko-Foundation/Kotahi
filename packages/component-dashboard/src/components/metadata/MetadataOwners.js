import React from 'react'

const MetadataOwners = ({ owners }) => (
  <span>
    {owners.map((owner, index) => [
      index === 0 ? null : <span>, </span>,
      <span>{owner.username || 'Anonymous'}</span>,
    ])}
  </span>
)

export default MetadataOwners
