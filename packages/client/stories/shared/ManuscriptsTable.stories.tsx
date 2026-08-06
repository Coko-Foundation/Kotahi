/* eslint-disable react-hooks/rules-of-hooks */

import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import ManuscriptsTable, {
  type ManuscriptsTableColumn,
} from '../../app/ui/shared/ManuscriptsTable'
import { MANUSCRIPT_STATUSES } from '../../app/ui/shared/ManuscriptStatus'
import {
  reviewerStatusValues,
  reviewerStatusTranslationKeys,
} from '../../app/ui/shared/_constants'
import Link from '../../app/ui/shared/Link'
import avatarImg from '../assets/avatar_sample.png'

const manuscriptStatusOptions = MANUSCRIPT_STATUSES.map(status => ({
  value: status,
  label: status,
}))

const reviewerStatusOptions = reviewerStatusValues.map(status => ({
  value: status,
  label: reviewerStatusTranslationKeys[status],
}))

const meta = preview.meta({
  component: ManuscriptsTable,
})

type Row = {
  key: string
  manuscriptNumber: number
  title: string
  status: string
  created: string
  updated: string
}

const columns: ManuscriptsTableColumn[] = [
  {
    title: 'No.',
    dataIndex: 'manuscriptNumber',
    key: 'manuscriptNumber',
    align: 'center',
  },
  { title: 'Title', dataIndex: 'title', key: 'title' },
  { title: 'Status', dataIndex: 'status', key: 'status', dataType: 'status' },
  { title: 'Created', dataIndex: 'created', key: 'created', dataType: 'date' },
  { title: 'Updated', dataIndex: 'updated', key: 'updated', dataType: 'date' },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: () => <Link to="#">View</Link>,
  },
]

const allData: Row[] = [
  {
    key: '1',
    manuscriptNumber: 101,
    title: 'Honey bee colonies benefit from grassland',
    status: 'submitted',
    created: '2026-07-01',
    updated: '2026-07-20',
  },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'A dataset of pollinator visitation rates',
    status: 'accepted',
    created: '2026-06-15',
    updated: '2026-07-18',
  },
  {
    key: '3',
    manuscriptNumber: 103,
    title: 'BeeTrack: software for tracking pollinators',
    status: 'inProgress',
    created: '2026-05-02',
    updated: '2026-07-10',
  },
  {
    key: '4',
    manuscriptNumber: 104,
    title: 'Neuropsychological effects of urban noise',
    status: 'rejected',
    created: '2026-04-11',
    updated: '2026-06-30',
  },
  {
    key: '5',
    manuscriptNumber: 105,
    title: 'Climate variability dataset for the Alps',
    status: 'completed',
    created: '2026-03-22',
    updated: '2026-05-14',
  },
]

const PAGE_SIZE = 3

export const Base = meta.story({
  args: {
    columns,
    dataSource: allData,
    page: 1,
    pageSize: PAGE_SIZE,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    const filtered = allData.filter(row =>
      row.title.toLowerCase().includes(search.toLowerCase()),
    )

    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    const handleSearch = (value: string): void => {
      setLoading(true)

      setTimeout(() => {
        setSearch(value)
        setPage(1)
        setLoading(false)
      }, 1000)
    }

    const handlePageChange = (newPage: number): void => {
      setLoading(true)

      setTimeout(() => {
        setPage(newPage)
        setLoading(false)
      }, 1000)
    }

    return (
      <ManuscriptsTable
        {...args}
        dataSource={pageData}
        loading={loading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        page={page}
        totalCount={filtered.length}
      />
    )
  },
})

const baseColumns: ManuscriptsTableColumn[] = [
  {
    title: 'No.',
    dataIndex: 'manuscriptNumber',
    key: 'manuscriptNumber',
    align: 'center',
  },
  { title: 'Title', dataIndex: 'title', key: 'title' },
]

const baseRow = {
  key: '1',
  manuscriptNumber: 101,
  title: 'Honey bee colonies benefit from grassland',
}

export const DefaultTextRendering = meta.story({
  args: {
    columns: baseColumns,
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const CenteredColumn = meta.story({
  args: {
    columns: [baseColumns[0], { ...baseColumns[1], align: 'center' }],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const AlignRightColumn = meta.story({
  args: {
    columns: [baseColumns[0], { ...baseColumns[1], align: 'right' }],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInDateRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
      },
    ],
    dataSource: [{ ...baseRow, created: '2026-07-01' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

/**
 * `filterable` on a column with the `date` data type shows a date-range picker.
 * No `options` needed here.
 */
export const BuiltInDateRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
        filterable: true,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const [start, end] = columnFilters.created ?? []

    const filtered =
      start && end
        ? allData.filter(row => row.created >= start && row.created <= end)
        : allData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

export const BuiltInStatusRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
      },
    ],
    dataSource: [{ ...baseRow, status: 'submitted' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInStatusRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
        filterable: true,
        options: manuscriptStatusOptions,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedStatuses = columnFilters.status ?? []

    const filtered =
      selectedStatuses.length > 0
        ? allData.filter(row => selectedStatuses.includes(row.status))
        : allData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

export const BuiltInReviewerStatusRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Reviewer status',
        dataIndex: 'reviewerStatus',
        key: 'reviewerStatus',
        dataType: 'reviewerStatus',
      },
    ],
    dataSource: [{ ...baseRow, reviewerStatus: 'invited' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInReviewerStatusRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Reviewer status',
        dataIndex: 'reviewerStatus',
        key: 'reviewerStatus',
        dataType: 'reviewerStatus',
        filterable: true,
        options: reviewerStatusOptions,
      },
    ],
    dataSource: [
      { ...baseRow, reviewerStatus: 'invited' },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        reviewerStatus: 'accepted',
      },
      {
        key: '3',
        manuscriptNumber: 103,
        title: 'BeeTrack: software for tracking pollinators',
        reviewerStatus: 'completed',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 3,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedStatuses = columnFilters.reviewerStatus ?? []

    const allRows = args.dataSource

    const filtered =
      selectedStatuses.length > 0
        ? allRows.filter(row => selectedStatuses.includes(row.reviewerStatus))
        : allRows

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

export const BuiltInBadgeRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'ADA status',
        dataIndex: 'adaStatus',
        key: 'adaStatus',
        dataType: 'badge',
      },
    ],
    dataSource: [{ ...baseRow, adaStatus: 'Compliant' }],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const BuiltInPersonRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Submitter',
        dataIndex: 'submitter',
        key: 'submitter',
        dataType: 'person',
      },
    ],
    dataSource: [
      {
        ...baseRow,
        submitter: {
          displayName: 'Jane Doe',
          profilePicture: avatarImg,
          orcid: '0000-0001-2345-6789',
        },
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
        submitter: {
          displayName: 'John Smith',
        },
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

const typeOptions = [
  { value: 'dataset', label: 'Dataset', labelColor: '#3f21d4' },
  { value: 'software', label: 'Software', labelColor: '#e901ca' },
  { value: 'article', label: 'Research article' },
]

const typeData = [
  { ...baseRow, type: 'dataset' },
  {
    key: '2',
    manuscriptNumber: 102,
    title: 'BeeTrack: software for tracking pollinators',
    type: 'software',
  },
  {
    key: '3',
    manuscriptNumber: 103,
    title: 'Neuropsychological effects of urban noise',
    type: 'article',
  },
]

export const BuiltInOptionsRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        dataType: 'options',
        options: typeOptions,
      },
    ],
    dataSource: typeData.slice(0, 2),
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

/**
 * Any column can be `filterable` as long as it has an `options` key.
 */
export const BuiltInOptionsRenderingWithFilter = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        dataType: 'options',
        filterable: true,
        options: typeOptions,
      },
    ],
    dataSource: typeData,
    page: 1,
    pageSize: 10,
    totalCount: typeData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({})

    const selectedTypes = columnFilters.type ?? []

    const filtered =
      selectedTypes.length > 0
        ? typeData.filter(row => selectedTypes.includes(row.type))
        : typeData

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

/**
 * Action uses a custom render function
 */
export const CustomRendering = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        render: (): ReactNode => <Link to="#">View</Link>,
      },
    ],
    dataSource: [baseRow],
    page: 1,
    pageSize: 10,
    totalCount: 1,
    onPageChange: () => {},
    onSearch: () => {},
  },
})

export const WithFiltersApplied = meta.story({
  args: {
    columns: [
      ...baseColumns,
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        dataType: 'status',
        filterable: true,
        options: manuscriptStatusOptions,
      },
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        dataType: 'date',
        filterable: true,
      },
    ],
    dataSource: allData,
    page: 1,
    pageSize: 10,
    totalCount: allData.length,
    onPageChange: () => {},
    onSearch: () => {},
  },
  render: args => {
    const [columnFilters, setColumnFilters] = useState<
      Record<string, string[]>
    >({
      status: ['submitted', 'accepted'],
      created: ['2026-06-01', '2026-07-31'],
    })

    const selectedStatuses = columnFilters.status ?? []
    const [start, end] = columnFilters.created ?? []

    const filtered = allData
      .filter(row =>
        selectedStatuses.length > 0
          ? selectedStatuses.includes(row.status)
          : true,
      )
      .filter(row =>
        start && end ? row.created >= start && row.created <= end : true,
      )

    return (
      <ManuscriptsTable
        {...args}
        columnFilters={columnFilters}
        dataSource={filtered}
        onFiltersChange={setColumnFilters}
        totalCount={filtered.length}
      />
    )
  },
})

/**
 * Show why a row matched
 */

export const WithSearchSnippets = meta.story({
  args: {
    columns: baseColumns,
    dataSource: [
      {
        ...baseRow,
        searchSnippets: [
          {
            field: 'Title',
            html: 'Honey bee colonies benefit from <b>grassland</b>',
          },
          {
            field: 'Abstract',
            html: '...pollinators depend on nearby <b>grassland</b> habitats for forage during the dry season...',
          },
        ],
      },
      {
        key: '2',
        manuscriptNumber: 102,
        title: 'A dataset of pollinator visitation rates',
      },
    ],
    page: 1,
    pageSize: 10,
    totalCount: 2,
    onPageChange: () => {},
    onSearch: () => {},
  },
})
