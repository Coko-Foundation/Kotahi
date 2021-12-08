import config from 'config'

/** Returns an array of column names, e.g.
 *  ['shortId', 'created', 'meta.title', 'submission.topic', 'status'] */
export default (config['client-features'].manuscriptsTableColumns || '')
  .split(',')
  .map(columnName => columnName.trim())
