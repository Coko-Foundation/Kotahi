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
  'authorProofingLink',
]

const reviewerColumns = columns => {
  if (columns.length === 0) {
    return [
      'shortId',
      'submission.$title',
      'reviewerStatusBadge',
      'reviewerLinks',
    ]
  }

  return columns.concat(['reviewerStatusBadge', 'reviewerLinks'])
}

module.exports = {
  editorColumns,
  ownerColumns,
  reviewerColumns,
}
