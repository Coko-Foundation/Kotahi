import React from 'react'
import { File } from 'xpub-ui'
import classes from './ReviewMetadata.local.scss'

const ReviewMetadata = ({ version, handlingEditors }) => (
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
          {version.declarations.openReview ? 'open' : 'closed'}
        </td>
      </tr>

      {!!handlingEditors && (
        <tr>
          <th className={classes.heading}>
            handling editor:
          </th>
          <td>
            {handlingEditors.map(user => (
              <span key={user.username}>{user.username}</span>
            ))}
          </td>
        </tr>
      )}

      {!!version.files.supplementary.length && (
        <tr>
          <th className={classes.heading}>
              {version.files.supplementary.length} supplementary {version.files.supplementary.length === 1 ? 'file' : 'files'}:
          </th>
          <td>
            {version.files.supplementary.map(file => (
              <File key={file.url} value={file}/>
            ))}
          </td>
        </tr>
      )}
      </tbody>
    </table>
  </div>
)

export default ReviewMetadata
