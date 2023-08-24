import {
  DefaultField,
  NewItemCheckbox,
  TitleWithAbstractAsTooltip,
  FilterableStatusBadge,
  LabelsOrSelectButton,
  Submitter,
  Editors,
  Actions,
  SubmitChevron,
  ReviewerItemLinks,
  EditorItemLinks,
  ReviewStatusDonut,
  OverdueTooltip,
  LastReviewerUpdated,
  ReviewerStatusBadge,
} from '../cell-components'
import reviewFilterOptions from '../../../../../config/journal/review-status'

/**
 * buildSpecialColumnProps: Build the special components for specific form fields
 * @param {object} specialComponentValues values needed for specific components
 * @returns {object} The built special components
 */
const buildSpecialColumnProps = (specialComponentValues, config) => {
  const {
    deleteManuscript,
    tryPublishManuscript,
    urlFrag,
    selectedNewManuscripts,
    toggleNewManuscriptCheck,
    setReadyToEvaluateLabel,
    archiveManuscript,
    reviewerRespond,
    getMainActionLink,
    currentUser,
    updateReviewerStatus,
  } = specialComponentValues

  const specialColumnProps = {
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
      flex: '0.25 1 7em',
    },
    updated: {
      title: 'Updated',
      canSort: true,
      canFilterByDateRange: true,
      defaultSortDirection: 'DESC',
      flex: '0.25 1 7em',
    },
    lastUpdated: {
      title: 'Last Status Update',
      component: LastReviewerUpdated,
      flex: '0.25 1 8em',
    },
    status: {
      title: 'Status',
      filterOptions: ['elife', 'ncrc'].includes(config?.instanceName)
        ? [
            { label: 'Unsubmitted', value: 'new' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Revise', value: 'revise' },
            { label: 'Revising', value: 'revising' },
            { label: 'Published', value: 'published' },
          ]
        : [
            { label: 'Unsubmitted', value: 'new' },
            { label: 'Submitted', value: 'submitted' },
            { label: 'Evaluated', value: 'evaluated' },
            { label: 'Published', value: 'published' },
          ],
      flex: '0.25 1 10em',
      component: FilterableStatusBadge,
      centered: true,
    },
    manuscriptVersions: {
      title: 'Version',
      flex: '0 1 6em',
      centered: true,
    },
    author: { title: 'Author', flex: '0 1 16em', component: Submitter },
    submitter: { title: 'Author', flex: '0 1 16em', component: Submitter }, // alias of 'author'
    editor: { title: 'Editor', flex: '0 1 12em', component: Editors },
    actions: {
      flex: '0 1 8em',
      component: Actions,
      extraProps: {
        config,
        deleteManuscript,
        tryPublishManuscript,
        urlFrag,
        archiveManuscript,
      },
    },
    submitChevron: {
      flex: '0 1 6em',
      component: SubmitChevron,
      extraProps: {
        urlFrag,
      },
    },
    reviewerStatusBadge: {
      title: 'Your Status',
      flex: '0.25 1 10em',
      canSort: true,
      defaultSortDirection: 'DESC',
      filterOptions: reviewFilterOptions,
      component: ReviewerStatusBadge,
      centered: true,
      extraProps: {
        currentUser,
      },
    },
    statusCounts: {
      title: 'Reviewer Status',
      flex: '0.25 1 10em',
      centered: true,
      component: ReviewStatusDonut,
    },
    editorLinks: {
      title: 'Actions',
      flex: '0 1 10em',
      component: EditorItemLinks,
      extraProps: {
        urlFrag,
      },
    },
    reviewerLinks: {
      flex: '0 1 10em',
      component: ReviewerItemLinks,
      extraProps: {
        urlFrag,
        reviewerRespond,
        currentUser,
        updateReviewerStatus,
        getMainActionLink,
      },
    },
    overdueTooltip: {
      flex: '0 0 1.5em',
      padding: '0',
      component: OverdueTooltip,
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
      component: config?.manuscript?.labelColumn
        ? LabelsOrSelectButton
        : DefaultField,
    },
    'submission.label': { flex: '0.2 1 10em' },
    'submission.journal': { flex: '0.2 1 12em' },
    'submission.articleDescription': {
      component:
        config?.instanceName === 'ncrc'
          ? TitleWithAbstractAsTooltip
          : DefaultField,
    },
    'meta.title': {
      component:
        config?.instanceName === 'colab'
          ? TitleWithAbstractAsTooltip
          : DefaultField,
    },
  }

  return specialColumnProps
}

export default buildSpecialColumnProps
