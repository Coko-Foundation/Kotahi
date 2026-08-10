import { type ReactNode, type MouseEvent, Fragment } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import {
  ConfigProvider,
  DatePicker,
  Radio,
  Tooltip,
  type TableColumnType,
} from 'antd'
import type { FilterDropdownProps } from 'antd/es/table/interface'
import type { RadioChangeEvent } from 'antd/es/radio'
import dayjs from 'dayjs'
import DOMPurify from 'isomorphic-dompurify'

import Table from './Table'
import Badge from './Badge'
import Avatar from './Avatar'
import {
  Close,
  Coar,
  Info,
  SemanticScholar,
  Table as TableIcon,
  Tasks,
} from '../base/Icons'
import ManuscriptStatus from './ManuscriptStatus'
import ReviewerStatus from './ReviewerStatus'
import {
  type ReviewerStatusValue,
  reviewerStatusTranslationKeys,
  reviewerStatusVariants,
  badgeVariantColorTokens,
  badgeDefaultColorToken,
} from './_constants'
import { convertTimestampToRelativeDateString } from '../../shared/dateUtils'

type ManuscriptsTableColumnOption = {
  value: string
  label?: string
  labelColor?: string
}

export type ManuscriptsTableColumn = {
  title: string
  dataIndex: string
  key: string
  align?: 'left' | 'center' | 'right'
  /**
   * Opts into one of this component's built-in renderers for a common kind of
   * value. Ignored if `render` is also supplied.
   */
  dataType?:
    | 'date'
    | 'status'
    | 'reviewerStatus'
    | 'reviewerStatusSummary'
    | 'badge'
    | 'options'
    | 'person'
    | 'title'
    | 'richText'
  options?: ManuscriptsTableColumnOption[]
  /** Applies to 'options', 'status', 'reviewerStatus' and 'date' datatypes */
  filterable?: boolean
  /**
   * Applies to the 'title' datatype -- shows an info icon that opens a tooltip
   * with the manuscript's abstract on click.
   */
  showAbstract?: boolean
  /**
   * Escape hatch for anything else (e.g. an actions column with
   * business-specific links) -- takes precedence over dataType.
   */
  render?: (value: any, record: any) => ReactNode
}

export type ManuscriptSearchSnippet = {
  field: string
  html: string
}

/**
 * Other gaps identified against the legacy component-manuscripts-table cell renderers that are
 * NOT candidates for a new dataType (see above), since they aren't a "render this value" concern:
 * - Value derivation: some legacy columns (reviewer's own status, last-reviewer-updated date,
 *   a status overridden by a second "published" field) already render fine via existing
 *   dataTypes, but need their value computed/aggregated from nested data (e.g. searching teams
 *   for the current user, or taking a max timestamp) before being handed to a column -- a data
 *   problem for the caller to solve, not a rendering gap here. See FilterableStatusBadge.jsx,
 *   ReviewerStatusBadge.jsx, LastReviewerUpdated.jsx.
 * - Role-filtered member list: Editors.jsx lists team members whose role isn't author/reviewer;
 *   generalizable in principle ("names of members matching a role filter") but currently
 *   hardcodes which roles to exclude rather than taking a parameter.
 */

/**
 * Two more legacy behaviors that are NOT gaps in this component -- the existing `render` escape
 * hatch already covers the mechanism (see the Actions column in ManuscriptsTable.stories.tsx and
 * in SubmissionsTable.jsx for a working example) -- but the actual business-specific logic still
 * needs to be written wherever EditorTable/ReviewerTable/the admin Manuscripts page eventually
 * migrate off the legacy table:
 * - Action links: Actions.jsx, EditorItemLinks.jsx, AuthorProofingLink.jsx,
 *   ReviewerItemLinks.jsx, SubmitChevron.jsx -- each needs the full manuscript, current user,
 *   config, routing, and mutation functions to decide which links/labels to show.
 * - Editable label dropdown: LabelsOrSelectButton.jsx/LabelDropdown.jsx -- an interactive,
 *   mutating widget (inline edit + workflow trigger), not a passive display of a value.
 */

type ManuscriptsTableProps = {
  columns: ManuscriptsTableColumn[]
  dataSource: Record<string, any>[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onSearch: (value: string) => void
  bordered?: boolean
  loading?: boolean
  /**
   * Currently selected filter values, keyed by column key (controlled), e.g.
   * { status: ['accepted', 'rejected'] }. Only relevant for columns with
   * `filterable: true`.
   */
  columnFilters?: Record<string, string[]>
  onFiltersChange?: (filters: Record<string, string[]>) => void
  /**
   * Compact/detailed view mode for 'reviewerStatusSummary' columns.
   * Defaults to 'detailed'.
   */
  reviewerStatusViewMode?: Record<string, 'compact' | 'detailed'>
  onReviewerStatusViewModeChange?: (
    columnKey: string,
    viewMode: 'compact' | 'detailed',
  ) => void
}

const renderDate = (value: any): ReactNode => {
  if (!value) return null
  return convertTimestampToRelativeDateString(value)
}

const renderStatus = (value: any): ReactNode => (
  <ManuscriptStatus small status={value} />
)

const renderReviewerStatus = (value: any): ReactNode => (
  <ReviewerStatus small status={value} />
)

const ReviewerStatusGridWrapper = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
  max-width: calc(${grid(4)} * 5 + ${grid(1)} * 4);
`

const ReviewerStatusSquare = styled.span<{ $colorToken: string }>`
  display: inline-block;
  width: ${grid(4)};
  height: ${grid(4)};
  border-radius: ${th('borderRadius')};
  background-color: ${(props: { theme: any; $colorToken: string }): string =>
    props.theme[props.$colorToken]};
`

const ReviewerStatusTooltipList = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${(props: { $columns: number }): string =>
    `repeat(${props.$columns}, minmax(0, 1fr))`};
  gap: ${grid(4)};
  padding: ${grid(2)};
`

const ReviewerStatusTooltipRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
  padding-bottom: ${grid(1)};
  margin-bottom: ${grid(1)};
  border-bottom: 1px solid ${th('colorBorder')};
  font-size: ${th('fontSizeBaseSmall')};
`

const ReviewerStatusTooltipSwatch = styled.span<{ $colorToken: string }>`
  flex-shrink: 0;
  width: ${grid(3)};
  height: ${grid(3)};
  border-radius: ${th('borderRadius')};
  background-color: ${(props: { theme: any; $colorToken: string }): string =>
    props.theme[props.$colorToken]};
`

const ReviewerStatusTooltipGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

const ReviewerStatusTooltipMembers = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${th('fontSizeBaseSmaller')};
`

const ReviewerStatusTooltipCompactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
  padding: ${grid(2)};
  font-size: ${th('fontSizeBaseSmall')};
`

const ReviewerStatusTooltipCompactRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
`

const resolveReviewerStatusColorToken = (
  status: ReviewerStatusValue,
): string => {
  const variant = reviewerStatusVariants[status]
  return variant ? badgeVariantColorTokens[variant] : badgeDefaultColorToken
}

type ReviewerStatusEntry = {
  status: ReviewerStatusValue
  name: string
}

const ReviewerStatusSummary = ({
  value,
  isCompact,
}: {
  value: any
  isCompact: boolean
}): ReactNode => {
  const { t } = useTranslation()

  if (!Array.isArray(value) || value.length === 0) return null

  const reviewers = value as ReviewerStatusEntry[]

  const groups: Partial<Record<ReviewerStatusValue, ReviewerStatusEntry[]>> = {}

  reviewers.forEach(reviewer => {
    groups[reviewer.status] = [...(groups[reviewer.status] ?? []), reviewer]
  })

  const groupEntries = Object.entries(groups) as [
    ReviewerStatusValue,
    ReviewerStatusEntry[],
  ][]

  const content = isCompact ? (
    <ReviewerStatusTooltipCompactList>
      {groupEntries.map(([status, members]) => (
        <ReviewerStatusTooltipCompactRow key={status}>
          <ReviewerStatusTooltipSwatch
            $colorToken={resolveReviewerStatusColorToken(status)}
          />
          <span>
            <strong>{members.length}</strong>{' '}
            {t(reviewerStatusTranslationKeys[status])}
          </span>
        </ReviewerStatusTooltipCompactRow>
      ))}
    </ReviewerStatusTooltipCompactList>
  ) : (
    <ReviewerStatusTooltipList $columns={Math.min(groupEntries.length, 3)}>
      {groupEntries.map(([status, members]) => (
        <ReviewerStatusTooltipGroup key={status}>
          <ReviewerStatusTooltipRow>
            <ReviewerStatusTooltipSwatch
              $colorToken={resolveReviewerStatusColorToken(status)}
            />
            <span>
              <strong>{members.length}</strong>{' '}
              {t(reviewerStatusTranslationKeys[status])}
            </span>
          </ReviewerStatusTooltipRow>
          <ReviewerStatusTooltipMembers>
            {members.map(member => (
              <span key={member.name}>{member.name}</span>
            ))}
          </ReviewerStatusTooltipMembers>
        </ReviewerStatusTooltipGroup>
      ))}
    </ReviewerStatusTooltipList>
  )

  return (
    <ConfigProvider theme={{ components: { Tooltip: { maxWidth: 600 } } }}>
      <Tooltip title={content}>
        <ReviewerStatusGridWrapper>
          {reviewers.map(({ status, name }) => (
            <ReviewerStatusSquare
              $colorToken={resolveReviewerStatusColorToken(status)}
              aria-label={`${name}: ${t(reviewerStatusTranslationKeys[status])}`}
              key={name}
              role="img"
            />
          ))}
        </ReviewerStatusGridWrapper>
      </Tooltip>
    </ConfigProvider>
  )
}

const renderBadge = (value: any): ReactNode => <Badge small>{value}</Badge>

const RICH_TEXT_PREFIX_REGEX = /^\s*<p(?: class="paragraph")?>/

const renderPlainOrRichText = (value: any): ReactNode => {
  if (!value || !RICH_TEXT_PREFIX_REGEX.test(value)) return value || null
  return (
    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} />
  )
}

const stripHtml = (html: string): string =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })

const renderRichText = (value: any): ReactNode => renderPlainOrRichText(value)

const renderSingleOption = (
  value: string,
  options: ManuscriptsTableColumnOption[],
): ReactNode => {
  const option = options.find(o => o.value === value)

  return (
    <Badge
      small
      style={
        option?.labelColor ? { backgroundColor: option.labelColor } : undefined
      }
    >
      {option?.label ?? value}
    </Badge>
  )
}

const OptionsListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
`

const renderOptions = (
  value: any,
  options: ManuscriptsTableColumnOption[] = [],
): ReactNode => {
  if (!value) return null

  if (Array.isArray(value)) {
    if (value.length === 0) return null

    return (
      <OptionsListWrapper>
        {value.map(v => (
          <Fragment key={v}>{renderSingleOption(v, options)}</Fragment>
        ))}
      </OptionsListWrapper>
    )
  }

  return renderSingleOption(value, options)
}

const PersonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(2)};
`

const PersonInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const PersonIdentifier = styled.span`
  color: ${th('colorTextPlaceholder')};
  font-size: ${th('fontSizeBaseSmaller')};
`

const renderPerson = (value: any): ReactNode => {
  if (!value) return null

  return (
    <PersonWrapper>
      <Avatar size={10} src={value.profilePicture} />
      <PersonInfo>
        <span>{value.displayName}</span>
        {value.orcid && (
          <PersonIdentifier>{`ORCID: ${value.orcid}`}</PersonIdentifier>
        )}
      </PersonInfo>
    </PersonWrapper>
  )
}

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${grid(1)};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${grid(3)};
`

const CoarIcon = styled(Coar)`
  margin-top: -2px;
`

const TitleAbstractButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`

const TitleAbstractTooltipContent = styled.div`
  padding: ${grid(4)};
`

const TitleAbstractTooltipHeader = styled.div`
  border-bottom: 1px solid ${th('colorTextReverse')};
  margin-bottom: ${grid(1)};
`

const ABSTRACT_WORD_LIMIT = 60

const truncateAbstract = (abstract: string): string => {
  const words = abstract.trim().split(/\s+/)
  if (words.length <= ABSTRACT_WORD_LIMIT) return abstract
  return `${words.slice(0, ABSTRACT_WORD_LIMIT).join(' ')}...`
}

type TitleCellValue = {
  title: string
  hasOverdueTasks?: boolean
  importSource?: 'coar' | 'semanticScholar'
  abstract?: string
}

const TitleCell = ({
  value,
  showAbstract,
}: {
  value: TitleCellValue
  showAbstract?: boolean
}): ReactNode => {
  const { t } = useTranslation()

  if (!value) return null

  return (
    <TitleWrapper>
      <TitleRow>
        {value.importSource === 'coar' && <CoarIcon aria-hidden />}
        {value.importSource === 'semanticScholar' && (
          <SemanticScholar aria-hidden />
        )}

        <span>{renderPlainOrRichText(value.title)}</span>

        {showAbstract && (
          <ConfigProvider
            theme={{ components: { Tooltip: { maxWidth: 600 } } }}
          >
            <Tooltip
              title={
                <TitleAbstractTooltipContent>
                  <TitleAbstractTooltipHeader>
                    {t('manuscriptsTable.abstractHeader')}
                  </TitleAbstractTooltipHeader>
                  {value.abstract
                    ? truncateAbstract(stripHtml(value.abstract))
                    : t('manuscriptsTable.noAbstract')}
                </TitleAbstractTooltipContent>
              }
              trigger={['click']}
            >
              <TitleAbstractButton
                aria-label={t('manuscriptsTable.showAbstract')}
                type="button"
              >
                <Info />
              </TitleAbstractButton>
            </Tooltip>
          </ConfigProvider>
        )}
      </TitleRow>

      {value.hasOverdueTasks && (
        <Badge small variant="error">
          {t('manuscriptsTable.overdueTasks')}
        </Badge>
      )}
    </TitleWrapper>
  )
}

const { RangePicker } = DatePicker

const DateRangeFilterWrapper = styled.div`
  padding: ${grid(2)};
`

const buildDateRangePresets = (): {
  label: string
  value: () => [any, any]
}[] => [
  { label: 'Today', value: () => [dayjs(), dayjs()] },
  {
    label: 'Yesterday',
    value: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
  },
  { label: 'Past 7 days', value: () => [dayjs().subtract(7, 'day'), dayjs()] },
  {
    label: 'Past 30 days',
    value: () => [dayjs().subtract(30, 'day'), dayjs()],
  },
  {
    label: 'Past 90 days',
    value: () => [dayjs().subtract(90, 'day'), dayjs()],
  },
  { label: 'Past year', value: () => [dayjs().subtract(1, 'year'), dayjs()] },
]

const DateRangeFilterDropdown = ({
  selectedKeys,
  setSelectedKeys,
  confirm,
}: FilterDropdownProps): ReactNode => {
  const [start, end] = selectedKeys as unknown as [string, string] | []

  const handleChange = (
    _dates: unknown,
    // antd passes null here (not ['', '']) when the range is cleared via the "x" button
    dateStrings: [string, string] | null,
  ): void => {
    setSelectedKeys(dateStrings?.[0] && dateStrings?.[1] ? dateStrings : [])
    confirm()
  }

  return (
    <DateRangeFilterWrapper>
      <RangePicker
        onChange={handleChange}
        presets={buildDateRangePresets()}
        value={start && end ? [dayjs(start), dayjs(end)] : null}
      />
    </DateRangeFilterWrapper>
  )
}

const SnippetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${grid(2)} ${grid(4)};
  font-size: ${th('fontSizeBaseSmall')};
`

const renderHighlightedSnippet = (html: string): ReactNode => {
  // replace postgres <b> tags with <mark>
  const matchTag = /<b>(.*?)<\/b>/g
  const parts: ReactNode[] = []
  let cursor = 0
  let match = matchTag.exec(html)

  while (match) {
    if (match.index > cursor) parts.push(html.slice(cursor, match.index))
    parts.push(<mark>{match[1]}</mark>)
    cursor = matchTag.lastIndex
    match = matchTag.exec(html)
  }

  if (cursor < html.length) parts.push(html.slice(cursor))

  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>)
}

const SearchSnippets = ({
  snippets,
}: {
  snippets: ManuscriptSearchSnippet[]
}): ReactNode => (
  <SnippetsWrapper>
    {snippets.map(({ field, html }) => (
      <div key={field}>
        <strong>{field}:</strong> {renderHighlightedSnippet(html)}
      </div>
    ))}
  </SnippetsWrapper>
)

const hasSearchSnippets = (row: Record<string, any>): boolean =>
  Array.isArray(row.searchSnippets) && row.searchSnippets.length > 0

const ReviewerStatusColumnHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${grid(2)};
`

const RadioGroup = styled(Radio.Group)`
  /* stylelint-disable declaration-no-important */
  .ant-radio-button-wrapper {
    background-color: ${th('colorPrimary')} !important;
    color: ${th('colorTextReverse')} !important;
    border: 1px solid transparent;
    transition: border 0.2s ease;

    span[role='img'] {
      margin-top: 3px;
    }

    &:hover {
      border: 1px solid ${th('colorTextReverse')};
    }
  }

  .ant-radio-button-wrapper-checked {
    background-color: ${th('colorTextReverse')} !important;
    color: ${th('colorPrimary')} !important;
    border-color: ${th('colorTextReverse')} !important;
  }
`

const ReviewerStatusColumnHeader = ({
  title,
  isCompact,
  onChange,
}: {
  title: string
  isCompact: boolean
  onChange: (isCompact: boolean) => void
}): ReactNode => {
  const { t } = useTranslation()

  return (
    <ReviewerStatusColumnHeaderWrapper>
      <span>{title}</span>
      <RadioGroup
        buttonStyle="solid"
        onChange={(event: RadioChangeEvent): void =>
          onChange(event.target.value === 'compact')
        }
        optionType="button"
        size="small"
        value={isCompact ? 'compact' : 'detailed'}
      >
        <Tooltip title="Detailed hover view">
          <Radio.Button
            aria-label={t('manuscriptsTable.detailedView')}
            value="detailed"
          >
            <TableIcon />
          </Radio.Button>
        </Tooltip>
        <Tooltip title="Compact hover view">
          <Radio.Button
            aria-label={t('manuscriptsTable.compactView')}
            value="compact"
          >
            <Tasks />
          </Radio.Button>
        </Tooltip>
      </RadioGroup>
    </ReviewerStatusColumnHeaderWrapper>
  )
}

const resolveColumn = (
  column: ManuscriptsTableColumn,
  context: {
    columnFilters?: Record<string, string[]>
    reviewerStatusViewMode?: Record<string, 'compact' | 'detailed'>
    onReviewerStatusViewModeChange?: (
      columnKey: string,
      viewMode: 'compact' | 'detailed',
    ) => void
  },
): TableColumnType<Record<string, any>> => {
  let resolved: ManuscriptsTableColumn = column

  if (!column.render) {
    switch (column.dataType) {
      case 'date':
        resolved = { ...column, render: renderDate }
        break
      case 'status':
        resolved = { ...column, render: renderStatus }
        break
      case 'reviewerStatus':
        resolved = { ...column, render: renderReviewerStatus }
        break
      case 'reviewerStatusSummary':
        resolved = {
          ...column,
          render: (value: any): ReactNode => (
            <ReviewerStatusSummary
              isCompact={
                (context.reviewerStatusViewMode?.[column.key] ?? 'detailed') ===
                'compact'
              }
              value={value}
            />
          ),
        }
        break
      case 'badge':
        resolved = { ...column, render: renderBadge }
        break
      case 'richText':
        resolved = { ...column, render: renderRichText }
        break
      case 'person':
        resolved = { ...column, render: renderPerson }
        break
      case 'title':
        resolved = {
          ...column,
          render: (value: any): ReactNode => (
            <TitleCell showAbstract={column.showAbstract} value={value} />
          ),
        }
        break
      case 'options':
        resolved = {
          ...column,
          render: (value: any): ReactNode =>
            renderOptions(value, column.options),
        }
        break
      default:
        break
    }
  }

  if (column.filterable && column.options) {
    return {
      ...resolved,
      filters: column.options.map(({ value, label }) => ({
        text: label ?? value,
        value,
      })),
      filteredValue: context.columnFilters?.[column.key] ?? null,
    }
  }

  if (column.filterable && column.dataType === 'date') {
    return {
      ...resolved,
      filterDropdown: (props: FilterDropdownProps) => (
        <DateRangeFilterDropdown {...props} />
      ),
      filteredValue: context.columnFilters?.[column.key] ?? null,
    }
  }

  if (column.dataType === 'reviewerStatusSummary') {
    return {
      ...resolved,
      title: (
        <ReviewerStatusColumnHeader
          isCompact={
            (context.reviewerStatusViewMode?.[column.key] ?? 'detailed') ===
            'compact'
          }
          onChange={isCompact =>
            context.onReviewerStatusViewModeChange?.(
              column.key,
              isCompact ? 'compact' : 'detailed',
            )
          }
          title={column.title}
        />
      ),
    }
  }

  return resolved
}

const FilterChipsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(1)};
  margin-bottom: ${grid(2)};
`

const FilterChipCloseButton = styled.button`
  display: inline-flex;
  margin-left: ${grid(2)};
  background: none;
  color: inherit;
  cursor: pointer;
`

const formatChipDate = (value: string): string =>
  dayjs(value).format('MMM D, YYYY')

type FilterChip = {
  key: string
  label: string
  onRemove: (event: MouseEvent<HTMLElement>) => void
}

const withoutColumnFilter = (
  filters: Record<string, string[]>,
  columnKey: string,
): Record<string, string[]> =>
  Object.fromEntries(
    Object.entries(filters).filter(([key]) => key !== columnKey),
  )

const buildFilterChips = (
  columns: ManuscriptsTableColumn[],
  columnFilters: Record<string, string[]>,
  onFiltersChange: (filters: Record<string, string[]>) => void,
): FilterChip[] => {
  const chips: FilterChip[] = []

  Object.entries(columnFilters).forEach(([columnKey, values]) => {
    if (!values || values.length === 0) return

    const column = columns.find(c => c.key === columnKey)
    if (!column) return

    if (column.dataType === 'date') {
      const [start, end] = values
      if (!start || !end) return

      chips.push({
        key: columnKey,
        label: `${column.title}: ${formatChipDate(start)} – ${formatChipDate(end)}`,
        onRemove: event => {
          event.preventDefault()
          onFiltersChange(withoutColumnFilter(columnFilters, columnKey))
        },
      })
      return
    }

    values.forEach(value => {
      const label = column.options?.find(o => o.value === value)?.label ?? value

      chips.push({
        key: `${columnKey}:${value}`,
        label: `${column.title}: ${label}`,
        onRemove: event => {
          event.preventDefault()
          const remaining = values.filter(v => v !== value)

          onFiltersChange(
            remaining.length > 0
              ? { ...columnFilters, [columnKey]: remaining }
              : withoutColumnFilter(columnFilters, columnKey),
          )
        },
      })
    })
  })

  return chips
}

const ManuscriptsTable = ({
  columns,
  dataSource,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onSearch,
  loading = false,
  columnFilters,
  onFiltersChange,
  reviewerStatusViewMode,
  onReviewerStatusViewModeChange,
}: ManuscriptsTableProps): ReactNode => {
  const { t } = useTranslation()

  const rowsWithSnippets = dataSource.filter(hasSearchSnippets)

  const expandable = rowsWithSnippets.length > 0 && {
    expandedRowKeys: rowsWithSnippets.map(row => row.key),
    expandedRowRender: (record: Record<string, any>): ReactNode => (
      <SearchSnippets snippets={record.searchSnippets} />
    ),
    rowExpandable: hasSearchSnippets,
    showExpandColumn: false,
  }

  const filterableColumns = columns.filter(column =>
    Boolean(
      column.filterable && (column.options || column.dataType === 'date'),
    ),
  )

  // Only reports which values are selected, for every filterable column.
  const handleTableChange = (
    _pagination: unknown,
    filters: Record<string, (string | number | boolean)[] | null>,
  ): void => {
    if (filterableColumns.length === 0 || !onFiltersChange) return

    onFiltersChange(
      Object.fromEntries(
        filterableColumns.map(column => [
          column.key,
          (filters[column.key] ?? []) as string[],
        ]),
      ),
    )
  }

  const resolvedColumns = columns.map(column =>
    resolveColumn(column, {
      columnFilters,
      reviewerStatusViewMode,
      onReviewerStatusViewModeChange,
    }),
  )

  const filterChips =
    columnFilters && onFiltersChange
      ? buildFilterChips(columns, columnFilters, onFiltersChange)
      : []

  return (
    <>
      {filterChips.length > 0 && (
        <FilterChipsWrapper>
          {filterChips.map(chip => (
            <Badge key={chip.key} small>
              {chip.label}
              <FilterChipCloseButton
                aria-label={t('manuscriptsTable.removeFilter')}
                onClick={chip.onRemove}
                type="button"
              >
                <Close />
              </FilterChipCloseButton>
            </Badge>
          ))}
        </FilterChipsWrapper>
      )}
      <Table
        bordered={false}
        columns={resolvedColumns}
        dataSource={dataSource}
        expandable={expandable}
        loading={loading}
        onChange={handleTableChange}
        onSearch={onSearch}
        pagination={{
          current: page,
          pageSize,
          total: totalCount,
          showTotal: (total: number, range: [number, number]) => (
            <Trans
              count={total}
              i18nKey="manuscriptsTable.pagination"
              values={{
                firstResult: range[0],
                lastResult: range[1],
                totalCount: total,
              }}
            />
          ),
          onChange: onPageChange,
        }}
        searchPlaceholder={t('common.Enter search terms...')}
        showSearch
      />
    </>
  )
}

export default ManuscriptsTable
