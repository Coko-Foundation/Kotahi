import React from 'react'
import { Table } from '../../app/components/component-reporting/src'

export const Base = args => <Table {...args} />
export const WithHeadings = Base.bind()
export const WithSomeHeadings = Base.bind()

const rows = [
  [
    1234,
    '2021-05-10',
    `Wigwams for Gooses' Bridles: a comparative study`,
    'Jack Horner',
    'Editor 1, Editor 2',
    'Reviewer 1, Reviewer 2, Reviewer 3',
    { content: 'revising', isHeading: true },
    null,
  ],
]

Base.args = {
  // prettier-ignore
  columnSchemas: [
    { width: '6.5em' },
    { width: '7em' },
    { width: '16em', flexGrow: 4 },
    { width: '12em', flexGrow: 1 },
    { width: '12em', flexGrow: 3 },
    { width: '14em', flexGrow: 3 },
    { width: '6em' },
    { width: '7em' },
  ],
  rows,
}

WithHeadings.args = {
  // prettier-ignore
  columnSchemas: [
    { heading: 'Manuscript number', width: '6.5em' },
    { heading: 'Entry date', width: '7em' },
    { heading: 'Title', width: '16em', flexGrow: 4 },
    { heading: 'Corresponding author', width: '12em', flexGrow: 1 },
    { heading: 'Editors', width: '12em', flexGrow: 3 },
    { heading: 'Reviewers', width: '14em', flexGrow: 3 },
    { heading: 'Status', width: '6em' },
    { heading: 'Published date', width: '7em' },
  ],
  rows,
}

WithSomeHeadings.args = {
  // prettier-ignore
  columnSchemas: [
    { width: '6.5em' },
    { width: '7em' },
    { heading: 'Title', width: '16em', flexGrow: 4 },
    { width: '12em', flexGrow: 1 },
    { heading: 'Editors', width: '12em', flexGrow: 3 },
    { heading: 'Reviewers', width: '14em', flexGrow: 3 },
    { width: '6em' },
    { width: '7em' },
  ],
  rows,
}

export default {
  title: 'Reporting/Table',
  component: Table,
  argTypes: {},
}
