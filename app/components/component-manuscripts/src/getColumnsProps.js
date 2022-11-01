import {
  DefaultField,
  NewItemCheckbox,
  TitleWithAbstractAsTooltip,
  FilterableStatusBadge,
  LabelsOrSelectButton,
  Submitter,
  Editors,
  Actions,
} from './cell-components'

const fieldCanBeSorted = field => {
  return ['AbstractEditor', 'TextField'].includes(field?.component)
}

const getColumnsProps = (
  columnNames,
  fieldDefinitions,
  uriQueryParams,
  columnToSortOn,
  sortDirection,
  deleteManuscript,
  isManuscriptBlockedFromPublishing,
  tryPublishManuscript,
  selectedNewManuscripts,
  toggleNewManuscriptCheck,
  setReadyToEvaluateLabel,
  urlFrag,
  currentSearchQuery,
  archiveManuscript,
) => {
  const specialColumnProperties = {
    shortId: {
      title: 'Manuscript number',
      canSort: true,
      defaultSortDirection: 'DESC',
      flex: '0 1 6em',
    },
    created: {
      title: 'Created',
      canSort: true,
      canFilterByDateRange: true,
      defaultSortDirection: 'DESC',
      flex: '0 1 7em',
    },
    updated: {
      title: 'Updated',
      canSort: true,
      canFilterByDateRange: true,
      defaultSortDirection: 'DESC',
      flex: '0 1 7em',
    },
    status: {
      title: 'Status',
      filterOptions: ['elife', 'ncrc'].includes(process.env.INSTANCE_NAME)
        ? [
            { label: 'Unsubmitted', value: 'new' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Evaluated', value: 'evaluated' },
            { label: 'Published', value: 'published' },
          ]
        : [
            { label: 'Unsubmitted', value: 'new' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Revise', value: 'revise' },
            { label: 'Revising', value: 'revising' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Published', value: 'published' },
          ],
      flex: '0 1 10em',
      component: FilterableStatusBadge,
    },
    author: { title: 'Submitter', flex: '0 1 16em', component: Submitter },
    editor: { title: 'Editor', flex: '0 1 12em', component: Editors },
    actions: {
      flex: '0 1 6em',
      component: Actions,
      extraProps: {
        deleteManuscript,
        isManuscriptBlockedFromPublishing,
        tryPublishManuscript,
        urlFrag,
        archiveManuscript,
      },
    },
    newItemCheckbox: {
      flex: '0 1 2em',
      component: NewItemCheckbox,
      extraProps: { selectedNewManuscripts, toggleNewManuscriptCheck },
    },
    'submission.topics': { flex: '0 1 10em' },
    'submission.labels': {
      flex: '0 1 10em',
      extraProps: { setReadyToEvaluateLabel },
      component: ['ncrc', 'colab'].includes(process.env.INSTANCE_NAME)
        ? LabelsOrSelectButton
        : DefaultField,
    },
    'submission.label': { flex: '0.2 1 10em' },
    'submission.journal': { flex: '0.2 1 12em' },
    'submission.articleDescription': {
      component:
        process.env.INSTANCE_NAME === 'ncrc'
          ? TitleWithAbstractAsTooltip
          : DefaultField,
    },
    'meta.title': {
      component:
        process.env.INSTANCE_NAME === 'colab'
          ? TitleWithAbstractAsTooltip
          : DefaultField,
    },
  }

  // TODO rather than sneak extra columns in here via adjustedColumnNames, just add the extra columns in the .env config
  const adjustedColumnNames = [...columnNames]
  adjustedColumnNames.push('actions')
  if (['ncrc', 'colab'].includes(process.env.INSTANCE_NAME))
    adjustedColumnNames.splice(0, 0, 'newItemCheckbox')

  return adjustedColumnNames.map(columnName => {
    const field = fieldDefinitions[columnName]
    const presetProps = specialColumnProperties[columnName] || {}

    // We disable sorting by column when showing search results, and just order by search ranking.
    // This could be changed in future to allow ordering within search results.
    const canSort =
      !currentSearchQuery && (presetProps.canSort || fieldCanBeSorted(field))

    const filterOptions = presetProps.filterOptions || field?.options

    const defaultProps = {
      name: columnName,
      title: field?.shortDescription ?? field?.title ?? '',
      defaultSortDirection: canSort ? 'ASC' : null,
      component: DefaultField,
      flex: '1 0.5 16em',
    }

    return {
      ...defaultProps,
      ...presetProps,
      canSort,
      filterOptions,
      filterValue:
        ((filterOptions || presetProps.canFilterByDateRange) &&
          uriQueryParams.find(p => p.field === columnName)?.value) ||
        null,
      sortDirection:
        canSort && columnToSortOn === columnName ? sortDirection : null,
    }
  })
}

export default getColumnsProps
