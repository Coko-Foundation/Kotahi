import React from 'react'
import Moment from 'react-moment'

const MetadataSubmittedDate = ({ submitted }) => (
  <span>
    <Moment format="YYYY-MM-DD">{submitted}</Moment>
  </span>
)

export default MetadataSubmittedDate
