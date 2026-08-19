/* eslint-disable */

import { useMemo, useContext, type ReactNode } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client/react'
import styled from 'styled-components'
import get from 'lodash/get'

import { ConfigContext } from '../../components/config/src'
import { useCurrentUser } from './useCurrentUser'
import {
  extractSortData,
  extractFilters,
  useQueryParams,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
  URI_SORT_PARAM,
  URI_REVIEWER_STATUS_PARAM,
} from '../../shared/urlParamUtils'
import { isValidDOI } from '../../shared/doiFieldDefinition'
import { MANUSCRIPT_STATUSES } from '../../ui/shared/ManuscriptStatus'
import { DASHBOARD } from '../../queries'
import Link from '../../ui/shared/Link'
import type {
  ManuscriptsTableColumn,
  ManuscriptsTableSortState,
} from '../../ui/shared/ManuscriptsTable'

const LinkList = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
`

type Variant = 'submitter' | 'editor' | 'reviewer'

type VariantConfig = {
  roles: string[]
  configColumnsKey: string
  defaultColumnKeys: string[]
}

const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  submitter: {
    roles: ['author'],
    configColumnsKey: 'mySubmissions',
    defaultColumnKeys: [
      'shortId',
      'submission.$title',
      'status',
      'created',
      'updated',
      'actions',
    ],
  },
  editor: {
    roles: ['seniorEditor', 'handlingEditor', 'editor'],
    configColumnsKey: 'editingQueue',
    defaultColumnKeys: [],
  },
  reviewer: {
    roles: [
      'reviewer',
      'invited:reviewer',
      'accepted:reviewer',
      'inProgress:reviewer',
      'completed:reviewer',
      'collaborativeReviewer',
      'invited:collaborativeReviewer',
      'accepted:collaborativeReviewer',
      'inProgress:collaborativeReviewer',
      'completed:collaborativeReviewer',
    ],
    configColumnsKey: 'tableColumns',
    defaultColumnKeys: [],
  },
}

// Shared across all variants -- titles for columns that aren't real submission-form fields.
// findColumnTitle() only falls back to this when a column key doesn't match an actual field name.
const SPECIAL_COLUMN_TITLES = t => ({
  'submission.$doi': t('formBuilder.fieldOpts.doi'),
  'submission.adaState': t('manuscriptsTable.adaState'),
  actions: 'Actions', // not in translation!
  author: t('manuscriptsTable.Author'),
  authorProofingLink: 'Actions', // not in translation!
  created: t('manuscriptsTable.Created'),
  editor: t('manuscriptsTable.Editor'),
  editorLinks: t('manuscriptsTable.Actions'),
  lastUpdated: t('manuscriptsTable.lastReviewerStatusUpdate'),
  manuscriptVersions: t('manuscriptsTable.Version'),
  reviewerLinks: 'Action', // not in translation!
  reviewerStatusBadge: t('manuscriptsTable.Your Status'),
  shortId: 'No.', // not in translation!
  status: t('manuscriptsTable.Status'),
  statusCounts: t('manuscriptsTable.Reviewer Status'),
  submitter: t('manuscriptsTable.Author'), // alias of 'author'
  titleAndAbstract: t('manuscriptsTable.Title'),
  updated: t('manuscriptsTable.Updated'),
})

const centeredColumns = [
  'shortId',
  'adaState',
  '$doi',
  'status',
  'manuscriptVersions',
  'reviewerStatusBadge',
  'statusCounts',
]

const importSourceFor = manuscript => {
  if (manuscript.importSourceServer === 'COAR') return 'coar'
  if (manuscript.importSourceServer === 'semantic-scholar')
    return 'semanticScholar'

  return undefined
}

const titleLinkFor = manuscript => {
  const { $doi, $sourceUri } = manuscript.submission || {}

  if ($sourceUri) return $sourceUri
  if ($doi && isValidDOI($doi))
    return `${$doi.includes('doi.org') ? '' : 'https://doi.org/'}${$doi}`

  return undefined
}

// The server's date-range filter value format is 'yyyyMMdd-yyyyMMdd' (see manuscriptUtils.js);
// ManuscriptsTable's date filter works with plain 'yyyy-MM-dd' boundaries instead, so convert
// between the two with simple string reformatting -- no timezone handling needed, since both
// sides already represent the same local calendar date.
const isoDateToCompact = isoDate => isoDate.replaceAll('-', '')

const compactDateToIso = (compactDate: string): string =>
  `${compactDate.slice(0, 4)}-${compactDate.slice(4, 6)}-${compactDate.slice(6, 8)}`

const isDateColumnKey = (
  key: string,
  fieldDefinitions: Record<string, any>,
): boolean =>
  ['created', 'updated'].includes(key) ||
  fieldDefinitions[key]?.component === 'DatePicker'

/** Per-variant actions-column content. Only 'submitter' is implemented so far. */
const renderActionsFor = (
  variant: Variant,
  record: Record<string, any>,
  {
    t,
    groupName,
    actionText,
  }: { t: any; groupName?: string; actionText: Record<string, string> },
): ReactNode => {
  if (variant === 'submitter') {
    const { id, status, showAuthorProofing } = record

    return (
      <LinkList>
        <Link to={`/${groupName}/versions/${id}/submit`}>
          {actionText[status]}
        </Link>

        {showAuthorProofing && (
          <Link to={`/${groupName}/versions/${id}/production`}>
            {(status === 'assigned' || status === 'inProgress') &&
              t('dashboardPage.mySubmissions.Provide production feedback')}

            {status === 'completed' &&
              t('dashboardPage.mySubmissions.View production feedback')}
          </Link>
        )}
      </LinkList>
    )
  }

  return null // TODO: editor/reviewer actions, once those tables are migrated
}

/** Per-variant extra row data that isn't tied to any column. Only 'submitter' is implemented. */
const enrichRowFor = (
  variant: Variant,
  row: Record<string, any>,
  manuscript: Record<string, any>,
  {
    authorProofingEnabled,
    currentUser,
  }: { authorProofingEnabled: boolean; currentUser: { id: string } },
): void => {
  if (variant === 'submitter') {
    const authorTeam = manuscript.teams.find(team => team.role === 'author')

    const sortedAuthors = authorTeam?.members
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(b.created).getTime() - new Date(a.created).getTime(),
      )

    row.showAuthorProofing =
      authorProofingEnabled &&
      manuscript.authorFeedback.assignedAuthors?.length > 0 &&
      sortedAuthors[0]?.user?.id === currentUser.id &&
      ['assigned', 'inProgress', 'completed'].includes(manuscript.status)
  }
}

type UseManuscriptsTableResult = {
  loading: boolean
  error: unknown
  columns: ManuscriptsTableColumn[]
  dataSource: Record<string, any>[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onSearch: (value: string) => void
  columnFilters: Record<string, string[]>
  onFiltersChange: (filters: Record<string, string[]>) => void
  sortState: ManuscriptsTableSortState | null
  onSortChange: (sortState: ManuscriptsTableSortState | null) => void
}

/** Fetches, and derives every prop <ManuscriptsTable> needs, for one of the role-scoped
 * dashboard tables (My Submissions / editing queue / reviews). */
const useManuscriptsTable = ({
  variant,
}: {
  variant: Variant
}): UseManuscriptsTableResult => {
  const { roles, configColumnsKey, defaultColumnKeys } = VARIANT_CONFIG[variant]

  // Reviewer invitations are tied to a specific version, so a reviewer needs the older-version
  // lookback to still see a manuscript they reviewed after it's been revised; authors/editors
  // don't have that problem. Inferred from the role names rather than passed explicitly.
  const searchInAllVersions = roles.some(role =>
    role.toLowerCase().includes('reviewer'),
  )

  const config: any = useContext(ConfigContext)
  const { t } = useTranslation()
  const { groupName } = useParams()
  const currentUser = useCurrentUser()
  const applyQueryParams = useQueryParams()
  const location = useLocation()
  const uriQueryParams = new URLSearchParams(location.search)

  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled

  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)
  const page = Number(uriQueryParams.get(URI_PAGENUM_PARAM)) || 1
  const pageSize = config?.manuscript?.paginationCount || 10

  const {
    data,
    previousData,
    loading: apolloLoading,
    error,
  } = useQuery(DASHBOARD, {
    variables: {
      reviewerStatus: uriQueryParams.get(URI_REVIEWER_STATUS_PARAM),
      wantedRoles: roles,
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
      searchInAllVersions,
    },
    fetchPolicy: 'network-only',
  })

  const currentData: any = data ?? previousData
  const loading = apolloLoading && !currentData

  const submissionForm = currentData?.formForPurposeAndCategory
  const manuscripts =
    currentData?.manuscriptsUserHasCurrentRoleIn?.manuscripts ?? []
  const totalCount =
    currentData?.manuscriptsUserHasCurrentRoleIn?.totalCount ?? 0

  const fieldDefinitions = useMemo(() => {
    const fields = submissionForm?.structure?.children ?? []
    const defs = {}
    fields.forEach(field => {
      // Incomplete fields in the formbuilder may not have a name specified. Ignore these
      if (field.name) defs[field.name] = field
    })
    return defs
  }, [submissionForm])

  // Shared with the legacy table's sort state (same 'sort' URI param), just
  // translated to/from antd's { columnKey, order: 'ascend' | 'descend' }.
  // An explicit sort applies regardless of whether a search is active (see
  // buildQueryForManuscriptSearchFilterAndOrder). The 'created' DESC default below is only a
  // display fallback for the *unsorted* case, and only applies without an active search --
  // while searching with no explicit sort, the server orders by search rank instead, so no
  // column should claim to be sorted.
  let sortState: ManuscriptsTableSortState | null = null

  if (sortName) {
    sortState = {
      columnKey: sortName,
      order: sortDirection === 'ASC' ? 'ascend' : 'descend',
    }
  } else if (!currentSearchQuery) {
    sortState = { columnKey: 'created', order: 'descend' }
  }

  const handleSortChange = newSortState =>
    applyQueryParams({
      [URI_SORT_PARAM]: newSortState
        ? `${newSortState.columnKey}_${newSortState.order === 'ascend' ? 'ASC' : 'DESC'}`
        : null,
      [URI_PAGENUM_PARAM]: 1,
    })

  const specialColumnTitles = useMemo(() => SPECIAL_COLUMN_TITLES(t), [t])

  const actionText = useMemo(
    () => ({
      new: t('manuscriptsTable.actions.continueSubmission'),
      submitted: t('manuscriptsTable.actions.View'),
      revise: t('manuscriptsTable.actions.revise'),
      revising: t('manuscriptsTable.actions.continueRevision'),
      accepted: t('manuscriptsTable.actions.View'),
      rejected: t('manuscriptsTable.actions.View'),
      published: t('manuscriptsTable.actions.View'),
      assigned: t('manuscriptsTable.actions.View'),
      inProgress: t('manuscriptsTable.actions.View'),
      completed: t('manuscriptsTable.actions.View'),
      underEmbargo: t('manuscriptsTable.actions.View'),
      embargoReleased: t('manuscriptsTable.actions.View'),
    }),
    [t],
  )

  const findColumnTitle = (key: string): string => {
    const formTitle = submissionForm?.structure?.children.find(
      field => field.name === key,
    )?.title

    if (formTitle) return formTitle
    if (specialColumnTitles[key]) return specialColumnTitles[key]
    return key
  }

  const configColumns = (config.dashboard?.[configColumnsKey] || []).map(
    tc => tc.value,
  )

  const columnKeys =
    configColumns.length > 0 ? [...configColumns, 'actions'] : defaultColumnKeys

  const tableColumns: ManuscriptsTableColumn[] = columnKeys
    .map(
      (key: string): ManuscriptsTableColumn => ({
        title: findColumnTitle(key),
        dataIndex: key,
        key,
        align: centeredColumns.includes(key) ? 'center' : 'left',
      }),
    )
    .map((column: ManuscriptsTableColumn): ManuscriptsTableColumn => {
      if (column.key === 'actions') {
        return {
          ...column,
          render: (_: any, record: any) =>
            renderActionsFor(variant, record, { t, groupName, actionText }),
        }
      }

      if (column.key === 'shortId') {
        return { ...column, sortable: true }
      }

      if (isDateColumnKey(column.key, fieldDefinitions)) {
        // Server sorts submission.* fields as LOWER(text) (manuscriptUtils.js), which works
        // correctly for DatePicker values -- they're persisted as ISO 8601 strings (see
        // app/components/shared/DatePicker.jsx), and ISO 8601 sorts correctly lexicographically.
        // Server also range-filters both created/updated and DatePicker submission fields the
        // same way (see applyFilters).
        return { ...column, dataType: 'date', sortable: true, filterable: true }
      }

      if (column.key === 'submission.$title') {
        // Server strips HTML before sorting jsonb text fields (see applySortOrder), so this
        // sorts on the visible title text rather than raw markup.
        return {
          ...column,
          dataType: 'title',
          showAbstract: true,
          sortable: true,
        }
      }

      if (column.key === 'status') {
        return {
          ...column,
          dataType: 'status',
          filterable: true,
          options: MANUSCRIPT_STATUSES.map(status => ({
            value: status,
            label: t(`msStatus.${status}`),
          })),
        }
      }

      if (column.key === 'submission.adaState') {
        return {
          ...column,
          dataType: 'badge',
          filterable: true,
          options: [
            { value: 'draft', label: t('decisionPage.decisionTab.Draft') },
            { value: 'process', label: t('decisionPage.decisionTab.Process') },
            {
              value: 'findable',
              label: t('decisionPage.decisionTab.Findable'),
            },
            { value: 'publish', label: t('decisionPage.decisionTab.Publish') },
          ],
        }
      }

      if (fieldDefinitions[column.key]?.options) {
        return {
          ...column,
          dataType: 'options',
          filterable: true,
          options: fieldDefinitions[column.key].options,
        }
      }

      if (
        ['TextField', 'AbstractEditor'].includes(
          fieldDefinitions[column.key]?.component,
        )
      ) {
        // Server strips HTML before sorting jsonb text fields (see applySortOrder), so this
        // works correctly for AbstractEditor (rich text) fields too, not just plain TextFields.
        return { ...column, sortable: true }
      }

      if (column.key === 'manuscriptVersions') {
        // Intentionally not sortable: it's a count (prior versions + current), derived from a
        // GraphQL relation rather than a real column or jsonb field the server can order by.
        return { ...column, sortable: false }
      }

      return column
    })

  // Keyed by the same URL param name as the column key (shared with the legacy table's filter
  // convention). Date columns store a compact 'yyyyMMdd-yyyyMMdd' range (see manuscriptUtils.js);
  // every other filterable column stores one or more selected values, comma-joined (the server
  // matches a row if the field equals ANY of them -- see applyFilters).
  const columnFilters = {}

  tableColumns
    .filter(column => column.filterable)
    .forEach(column => {
      const value = uriQueryParams.get(column.key)
      if (!value) return

      if (column.dataType === 'date') {
        const [start, end] = value.split('-')

        if (start && end)
          columnFilters[column.key] = [
            compactDateToIso(start),
            compactDateToIso(end),
          ]

        return
      }

      columnFilters[column.key] = value.split(',')
    })

  const handleFiltersChange = (newColumnFilters: Record<string, string[]>) =>
    applyQueryParams({
      ...Object.fromEntries(
        Object.entries(newColumnFilters).map(([key, values]) => {
          const column = tableColumns.find(c => c.key === key)

          if (column?.dataType === 'date') {
            const [start, end] = values ?? []

            return [
              key,
              start && end
                ? `${isoDateToCompact(start)}-${isoDateToCompact(end)}`
                : null,
            ]
          }

          return [key, values && values.length > 0 ? values.join(',') : null]
        }),
      ),
      [URI_PAGENUM_PARAM]: 1,
    })

  const dataSource = manuscripts.map((manuscriptObj: any) => {
    const manuscript = { ...manuscriptObj }
    manuscript.submission = JSON.parse(manuscript.submission)

    const row = tableColumns.reduce<Record<string, any>>(
      (accumulator, current) => {
        const property = current.dataIndex

        if (property === 'submission.$title') {
          accumulator[property] = {
            title: get(manuscript, property),
            hasOverdueTasks: manuscript.hasOverdueTasksForUser,
            importSource: importSourceFor(manuscript),
            abstract: manuscript.submission?.$abstract,
            link: titleLinkFor(manuscript),
          }

          return accumulator
        }

        accumulator[property] = get(manuscript, property)
        return accumulator
      },
      {},
    )

    row.key = manuscript.shortId
    row.id = manuscript.id
    row.published = manuscript.published
    enrichRowFor(variant, row, manuscript, {
      authorProofingEnabled,
      currentUser,
    })

    return row
  })

  return {
    loading,
    error,
    columns: tableColumns,
    dataSource,
    page: Number(page),
    pageSize,
    totalCount,
    onPageChange: newPage => applyQueryParams({ [URI_PAGENUM_PARAM]: newPage }),
    onSearch: value => applyQueryParams({ [URI_SEARCH_PARAM]: value }),
    columnFilters,
    onFiltersChange: handleFiltersChange,
    sortState,
    onSortChange: handleSortChange,
  }
}

export default useManuscriptsTable
