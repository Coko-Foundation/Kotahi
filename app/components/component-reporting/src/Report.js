import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'
import DateRangePicker from './DateRangePicker'
import SummaryReport from './SummaryReport'
import Table from './Table'
import SparkBar from './SparkBar'

const Page = styled.div`
  height: 100vh;
  overflow-y: auto;
  padding: 0 ${grid(2)};
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: ${th('gridUnit')} 0;
`

export const Content = styled.div`
  background-color: ${th('colorBackgroundHue')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const SelectionLine = styled.div`
  margin-bottom: 1.5em;
`

const reportTypes = [
  'Summary',
  'Manuscript',
  'Handling editor',
  'Managing editor',
  'Reviewer',
  'Author',
]

const generateSparkBars = (
  values,
  onClick,
  labelMapper,
  columnIndex,
  color,
) => {
  const highest = Math.max.apply(null, values)
  return values.map(v =>
    typeof v === 'number' ? (
      // eslint-disable-next-line react/jsx-key
      <SparkBar
        color={color}
        label={labelMapper && labelMapper(v, columnIndex)}
        onClick={onClick}
        rangeMax={highest}
        value={v}
      />
    ) : (
      v
    ),
  )
}

const getTableDataWithSparkBars = (columns, labelMapper) => {
  const columnSparkBarContents = columns.map(
    (val, columnIndex) =>
      generateSparkBars(
        val,
        () => {},
        labelMapper,
        columnIndex,
        lightenBy('colorSecondary', 0.7),
      ), // TODO make these clickable
  )

  return columns[0].map((_, i) => {
    const row = []
    columnSparkBarContents.forEach(column => row.push({ content: column[i] }))
    return row
  })
}

const getReport = (
  reportType,
  startDate,
  endDate,
  getSummaryData,
  getManuscriptsData,
  getHandlingEditorsData,
  getManagingEditorsData,
  getReviewersData,
  getAuthorsData,
) => {
  if (reportType === 'Summary') {
    return <SummaryReport {...getSummaryData(startDate, endDate)} />
  }

  if (reportType === 'Manuscript') {
    return (
      <Table
        headings={[
          'Manuscript number',
          'Entry date',
          'Title',
          'Corresponding author',
          'Editors',
          'Reviewers',
          'Status',
          'Published date',
        ]}
        rows={getManuscriptsData(startDate, endDate)}
        sizings={[
          { width: '6.5em' },
          { width: '7em' },
          { width: '16em', flexGrow: 4 },
          { width: '12em', flexGrow: 1 },
          { width: '12em', flexGrow: 3 },
          { width: '14em', flexGrow: 3 },
          { width: '6em' },
          { width: '7em' },
        ]}
      />
    )
  }

  if (reportType === 'Handling editor') {
    return (
      <Table
        headings={[
          'Editor name',
          'Manuscripts assigned',
          'Assigned for review',
          'Revised',
          'Rejected',
          'Accepted',
          'Published',
        ]}
        rows={getTableDataWithSparkBars(
          getHandlingEditorsData(startDate, endDate),
        )}
        sizings={[
          { width: '12em', flexGrow: 3 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
        ]}
      />
    )
  }

  if (reportType === 'Managing editor') {
    return (
      <Table
        headings={[
          'Editor name',
          'Manuscripts assigned',
          'Assigned for review',
          'Revised',
          'Rejected',
          'Accepted',
          'Published',
        ]}
        rows={getTableDataWithSparkBars(
          getManagingEditorsData(startDate, endDate),
        )}
        sizings={[
          { width: '12em', flexGrow: 3 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
        ]}
      />
    )
  }

  if (reportType === 'Reviewer') {
    return (
      <Table
        headings={[
          'Reviewer name',
          'Review invites',
          'Invites declined',
          'Reviews completed',
          'Average review duration',
          'Recommended to accept',
          'Recommended to revise',
          'Recommended to reject',
        ]}
        rows={getTableDataWithSparkBars(
          getReviewersData(startDate, endDate),
          (val, column) =>
            column === 4 ? `${val} day${val === 1 ? '' : 's'}` : val,
        )}
        sizings={[
          { width: '12em', flexGrow: 3 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
        ]}
      />
    )
  }

  if (reportType === 'Author') {
    return (
      <Table
        headings={[
          'Author name',
          'Unsubmitted',
          'Submitted',
          'Rejected',
          'Revision requested',
          'Accepted',
          'Published',
        ]}
        rows={getTableDataWithSparkBars(getAuthorsData(startDate, endDate))}
        sizings={[
          { width: '12em', flexGrow: 3 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
          { width: '7em', flexGrow: 1 },
        ]}
      />
    )
  }

  return null
}

const Report = ({
  getSummaryData,
  getManuscriptsData,
  getHandlingEditorsData,
  getManagingEditorsData,
  getReviewersData,
  getAuthorsData,
}) => {
  const [endDate, setEndDate] = useState(Date.now())

  const [startDate, setStartDate] = useState(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  )

  const [reportType, setReportType] = useState(reportTypes[0])

  return (
    <Page>
      <Heading>Reports</Heading>
      <SelectionLine>
        Show{' '}
        <select
          onChange={e => setReportType(e.target.value)}
          value={reportType}
        >
          {reportTypes.map(t => (
            <option key={t} label={t} value={t} />
          ))}
        </select>{' '}
        activity for manuscripts arriving{' '}
        <DateRangePicker
          endDate={endDate}
          max={Date.now()}
          setDateRange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          startDate={startDate}
        />
      </SelectionLine>
      <Content>
        {getReport(
          reportType,
          startDate,
          endDate,
          getSummaryData,
          getManuscriptsData,
          getHandlingEditorsData,
          getManagingEditorsData,
          getReviewersData,
          getAuthorsData,
        )}
      </Content>
    </Page>
  )
}

Report.propTypes = {
  getSummaryData: PropTypes.func.isRequired,
  getManuscriptsData: PropTypes.func.isRequired,
  getHandlingEditorsData: PropTypes.func.isRequired,
  getManagingEditorsData: PropTypes.func.isRequired,
  getReviewersData: PropTypes.func.isRequired,
  getAuthorsData: PropTypes.func.isRequired,
}

export default Report
