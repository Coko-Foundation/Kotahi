import React from 'react'
import { Table } from '../../app/components/component-reporting/src'
import {
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  generateAuthorsData,
} from './mockReportingData'

export const ResearchObjects = args => <Table {...args} />
export const HandlingEditors = ResearchObjects.bind()
export const Reviewers = ResearchObjects.bind()
export const ManagingEditors = ResearchObjects.bind()
export const Authors = ResearchObjects.bind()

const pivot = columns => {
  const rows = []
  for (let i = 0; i < columns[0].length; i += 1)
    rows.push(columns.map(col => col[i]))
  return rows
}

ResearchObjects.args = {
  sizings: [
    { width: '6.5em' },
    { width: '7em' },
    { width: '16em', flexGrow: 4 },
    { width: '12em', flexGrow: 1 },
    { width: '12em', flexGrow: 3 },
    { width: '14em', flexGrow: 3 },
    { width: '6em' },
    { width: '7em' },
  ],
  headings: [
    'Manuscript number',
    'Entry date',
    'Title',
    'Corresponding author',
    'Editors',
    'Reviewers',
    'Status',
    'Published date',
  ],
  rows: generateResearchObjectsData(),
}

HandlingEditors.args = {
  sizings: [
    { width: '12em', flexGrow: 3 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
  ],
  headings: [
    'Editor name',
    'Manuscripts assigned',
    'Assigned for review',
    'Revised',
    'Rejected',
    'Accepted',
    'Published',
  ],
  rows: pivot(generateEditorsData()),
}

ManagingEditors.args = HandlingEditors.args

Reviewers.args = {
  sizings: [
    { width: '12em', flexGrow: 3 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
  ],
  headings: [
    'Reviewer name',
    'Review invites',
    'Invites declined',
    'Reviews completed',
    'Average review duration',
    'Recommended to accept',
    'Recommended to revise',
    'Recommended to reject',
  ],
  rows: pivot(generateReviewersData()),
}

Authors.args = {
  sizings: [
    { width: '12em', flexGrow: 3 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
    { width: '7em', flexGrow: 1 },
  ],
  headings: [
    'Author name',
    'Unsubmitted',
    'Submitted',
    'Rejected',
    'Revision requested',
    'Accepted',
    'Published',
  ],
  rows: pivot(generateAuthorsData()),
}

export default {
  title: 'Reporting/Table',
  component: Table,
  argTypes: {},
}
