import React from 'react'
// import { File } from 'xpub-ui'
import classes from './ReviewMetadata.local.scss'

const ReviewMetadata = ({ version }) => (
  <div>
    <div className={classes.title}>
      Metadata
    </div>

    <table>
      <tbody>
      <tr>
        <th className={classes.heading}>
          peer review:
        </th>
        <td>
          {version.declarations.openReview ? 'Open' : 'Closed'}
        </td>
      </tr>
      <tr>
        <th className={classes.heading}>
          managing editor:
        </th>
        <td>
          TODO
        </td>
      </tr>
      <tr>
        <th className={classes.heading}>
          {version.files.supplementary.length} supplementary {version.files.supplementary.length === 1 ? 'file' : 'files'}:
        </th>
        <td>
          {/*{version.files.supplementary.map(file => (
            <File key={file.url} value={file}/>
          ))}*/}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
)

export default ReviewMetadata
