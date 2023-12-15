/*
Journals may want to display their manuscript tables with different columns
*/
const editorColumns = [
  'shortId',
  'overdueTooltip',
  'submission.$title',
  'status',
  'manuscriptVersions',
  'statusCounts',
  'lastUpdated',
  'editorLinks',
]

const ownerColumns = [
  'shortId',
  'submission.$title',
  'status',
  'created',
  'updated',
  'submitChevron',
]

const reviewerColumns = [
  'shortId',
  'submission.$title',
  'reviewerStatusBadge',
  'reviewerLinks',
]

module.exports = {
  editorColumns,
  ownerColumns,
  reviewerColumns,
}
