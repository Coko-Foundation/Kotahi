export default (process.env.MANUSCRIPTS_TABLE_COLUMNS || [])
  .split(',')
  .map(columnName => columnName.trim())
