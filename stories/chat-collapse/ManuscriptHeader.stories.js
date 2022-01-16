import React from 'react'
import {
  ManuscriptsTable,
  ManuscriptsHeaderRow,
} from '../../app/components/component-manuscripts/src/style'
import FilterSortHeader from '../../app/components/component-manuscripts/src/FilterSortHeader'

const TableTitleElements = [
  {
    name: 'shortId',
    title: 'Manuscript number',
    defaultSortDirection: 'DESC',
    flex: '0 1 6em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'meta.title',
    title: 'Title',
    defaultSortDirection: 'ASC',
    flex: '1 0.5 16em',
    canSort: true,
    filterOptions: null,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'created',
    title: 'Created',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: 'DESC',
  },
  {
    name: 'updated',
    title: 'Updated',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'status',
    title: 'Status',
    defaultSortDirection: null,
    flex: '0 1 10em',
    filterOptions: [
      {
        label: 'Unsubmitted',
        value: 'new',
      },
      {
        label: 'Submitted',
        value: 'submitted',
      },
      {
        label: 'Accepted',
        value: 'accepted',
      },
      {
        label: 'Rejected',
        value: 'rejected',
      },
      {
        label: 'Revise',
        value: 'revise',
      },
      {
        label: 'Revising',
        value: 'revising',
      },
      {
        label: 'Published',
        value: 'published',
      },
    ],
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'author',
    title: 'Author',
    defaultSortDirection: null,
    flex: '0 1 16em',
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
  {
    name: 'actions',
    title: '',
    defaultSortDirection: null,
    flex: '0 1 6em',
    extraProps: {},
    canSort: false,
    filterValue: null,
    sortDirection: null,
  },
]

export const Base = args => (
  <ManuscriptsTable>
    <ManuscriptsHeaderRow>
      {TableTitleElements?.map(info => (
        <FilterSortHeader
          columnInfo={info}
          key={info.name}
          sortDirection={info.sortDirection}
          sortName="created"
        />
      ))}
    </ManuscriptsHeaderRow>
  </ManuscriptsTable>
)

export default {
  title: 'Manuscripts/ManuscriptHeader',
  component: ManuscriptsTable,
  argTypes: {},
}
