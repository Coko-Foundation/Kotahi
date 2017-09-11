import React from 'react'
import classes from './ReviewMetadata.local.scss'

const ReviewMetadata = ({ version }) => (
  <div>
    <div className={classes.title}>
      Metadata
    </div>

    <table>
      <tbody>
      <tr>
        <th className={classes.heading}>keywords:</th>
        <td>{version.metadata.keywords.join(', ')}</td>
      </tr>
      </tbody>
    </table>
  </div>
)

export default ReviewMetadata
