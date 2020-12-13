/* eslint-disable react/prop-types */

import React from 'react'

const MetadataReviewType = ({ openPeerReview }) => (
  <span>{openPeerReview === 'yes' ? 'Open review' : 'Closed review'}</span>
)

export default MetadataReviewType
