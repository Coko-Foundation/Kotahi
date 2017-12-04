import React from 'react'
import Moment from 'react-moment'

const MetadataSubmittedDate = ({ submitted }) => (
  <Moment format="YYYY-MM-DD">{submitted}</Moment>
)

export default MetadataSubmittedDate
