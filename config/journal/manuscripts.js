/*
Journals may want to display their manuscript tables with different columns
*/
const editorColumns = [
  'shortId',
  'overdueTooltip',
  'meta.title',
  'status',
  'manuscriptVersions',
  'statusCounts',
  'lastUpdated',
  'editorLinks',
]

const ownerColumns = [
  'shortId',
  'meta.title',
  'status',
  'created',
  'updated',
  'submitChevron',
]

const reviewerColumns = [
  'shortId',
  'meta.title',
  'reviewerStatusBadge',
  'reviewerLinks',
]

module.exports = {
  editorColumns,
  ownerColumns,
  reviewerColumns,
}
