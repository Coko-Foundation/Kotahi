import React from 'react'

const MetadataReviewType = ({ openReview }) => (
  <span>
    {openReview ? 'Open review' : 'Closed review'}
  </span>
)

export default MetadataReviewType
