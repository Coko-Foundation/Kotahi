import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { forEach, map } from 'lodash'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'
import DateRangePicker from './DateRangePicker'
import SummaryReport from './SummaryReport'
import Table from './Table'
import SparkBar from './SparkBar'
import Tooltip from './Tooltip'

const Page = styled.div`
  height: 100vh;
  overflow-y: auto;
  padding: 0 ${grid(2)} ${grid(3)} ${grid(2)};
`

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: ${th('gridUnit')} 0;
`

const MinorNote = styled.span`
  color: ${lightenBy('colorText', 0.5)};
  font-size: 80%;
`

export const Content = styled.div`
  background-color: ${th('colorBackgroundHue')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const SelectionLine = styled.div`
  margin-bottom: 1.5em;
`

const reportTypes = ['Summary', 'Manuscript', 'Editor', 'Reviewer', 'Author']

const getTableDataWithSparkBars = (rows, labelMapper) => {
  if (rows.length < 1) return []

  // Find maximum values in each column (or 0 for non-numeric or negative data)
  const columnMaxima = {}
  forEach(rows[0], (_, key) => {
    columnMaxima[key] = rows.reduce((max, row) => {
      let val = row[key]
      if (typeof val !== 'number') val = 0
      return Math.max(max, val)
    }, 0)
  })

  // Return all rows, substituting a SparkBar for numbers. If a labelMapper function is supplied, derive cell text using this.
  return rows.map(row =>
    map(row, (val, key) => {
      if (typeof val !== 'number')
        return labelMapper ? labelMapper(val, key) : val
      return (
        // eslint-disable-next-line react/jsx-key
        <SparkBar
          color={lightenBy('colorSecondary', 0.7)}
          label={labelMapper && labelMapper(val, key)}
          onClick={undefined}
          rangeMax={columnMaxima[key]}
          value={val}
        />
      )
    }),
  )
}

const getReport = (
  reportType,
  startDate,
  endDate,
  getSummaryData,
  getManuscriptsData,
  getEditorsData,
  getReviewersData,
  getAuthorsData,
) => {
  if (reportType === 'Summary') {
    return (
      <SummaryReport
        endDate={endDate}
        startDate={startDate}
        {...getSummaryData(startDate, endDate)}
      />
    )
  }

  if (reportType === 'Manuscript') {
    const rows = getTableDataWithSparkBars(
      getManuscriptsData(startDate, endDate),
      (val, key) => {
        if (['editors', 'reviewers', 'authors'].includes(key))
          return val.reduce(
            (accum, curr) => (accum ? `${accum}, ${curr.name}` : curr.name),
            null,
          )
        return val
      },
    )

    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: 'Manuscript number', name: 'shortId', width: '6.5em' },
          { heading: 'Entry date', name: 'entryDate', width: '7em' },
          { heading: 'Title', name: 'title', width: '16em', flexGrow: 4 },
          { heading: 'Author', name: 'authors', width: '12em', flexGrow: 1 },
          { heading: 'Editors', name: 'editors', width: '12em', flexGrow: 3 },
          { heading: 'Reviewers', name: 'reviewers', width: '14em', flexGrow: 3 },
          { heading: 'Status', name: 'status', width: '6em' },
          { heading: 'Published date', name: 'publishedDate', width: '7em' },
        ]}
        rows={rows}
      />
    )
  }

  if (reportType === 'Editor') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: 'Editor name', name: 'name', width: '12em', flexGrow: 3 },
          { heading: 'Manuscripts assigned', name: 'assignedCount', width: '7em', flexGrow: 1 },
          { heading: 'Assigned for review', name: 'givenToReviewersCount', width: '7em', flexGrow: 1 },
          { heading: 'Revised', name: 'revisedCount', width: '7em', flexGrow: 1 },
          { heading: 'Rejected', name: 'rejectedCount', width: '7em', flexGrow: 1 },
          { heading: 'Accepted', name: 'acceptedCount', width: '7em', flexGrow: 1 },
          { heading: 'Published', name: 'publishedCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(getEditorsData(startDate, endDate))}
      />
    )
  }

  if (reportType === 'Reviewer') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: 'Reviewer name', name: 'name', width: '12em', flexGrow: 3 },
          { heading: 'Review invites', name: 'invitesCount', width: '7em', flexGrow: 1 },
          { heading: 'Invites declined', name: 'declinedCount', width: '7em', flexGrow: 1 },
          { heading: 'Reviews completed', name: 'reviewsCompletedCount', width: '7em', flexGrow: 1 },
          { heading: 'Average review duration', name: 'avgReviewDuration', width: '7em', flexGrow: 1 },
          { heading: 'Recommended to accept', name: 'reccAcceptCount', width: '7em', flexGrow: 1 },
          { heading: 'Recommended to revise', name: 'reccReviseCount', width: '7em', flexGrow: 1 },
          { heading: 'Recommended to reject', name: 'reccRejectCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(
          getReviewersData(startDate, endDate),
          (val, column) => {
            if (column !== 'avgReviewDuration') return val
            const roundedVal = Math.round(val * 10) / 10
            return `${roundedVal} day${roundedVal === 1 ? '' : 's'}`
          },
        )}
      />
    )
  }

  if (reportType === 'Author') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: 'Author name', name: 'name', width: '12em', flexGrow: 3 },
          { heading: 'Unsubmitted', name: 'unsubmittedCount', width: '7em', flexGrow: 1 },
          { heading: 'Submitted', name: 'submittedCount', width: '7em', flexGrow: 1 },
          { heading: 'Rejected', name: 'rejectedCount', width: '7em', flexGrow: 1 },
          { heading: 'Revision requested', name: 'revisionCount', width: '7em', flexGrow: 1 },
          { heading: 'Accepted', name: 'acceptedCount', width: '7em', flexGrow: 1 },
          { heading: 'Published', name: 'publishedCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(getAuthorsData(startDate, endDate))}
      />
    )
  }

  return null
}

const Report = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  getSummaryData,
  getManuscriptsData,
  getEditorsData,
  getReviewersData,
  getAuthorsData,
}) => {
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
        <span>
          activity for manuscripts arriving
          <Tooltip
            content={
              <>
                Metrics are shown for manuscripts that were first entered
                <br />
                into the system between these dates. Date boundaries are
                <br />
                at midnight in Universal Time.
              </>
            }
          />
        </span>{' '}
        <DateRangePicker
          endDate={endDate}
          max={Date.now()}
          setDateRange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          startDate={startDate}
        />{' '}
        <MinorNote>UTC</MinorNote>
      </SelectionLine>
      <Content>
        {getReport(
          reportType,
          startDate,
          endDate,
          getSummaryData,
          getManuscriptsData,
          getEditorsData,
          getReviewersData,
          getAuthorsData,
        )}
      </Content>
    </Page>
  )
}

Report.propTypes = {
  startDate: PropTypes.number.isRequired,
  endDate: PropTypes.number.isRequired,
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired,
  getSummaryData: PropTypes.func.isRequired,
  getManuscriptsData: PropTypes.func.isRequired,
  getEditorsData: PropTypes.func.isRequired,
  getReviewersData: PropTypes.func.isRequired,
  getAuthorsData: PropTypes.func.isRequired,
}

export default Report
