import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th, lighten } from '@pubsweet/ui-toolkit'
import DateRangePicker from './DateRangePicker'
import Table from './Table'

const Heading = styled.div`
  color: ${th('colorPrimary')};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  margin: ${th('gridUnit')} 0;
  text-transform: uppercase;
`

const SelectionLine = styled.div`
  margin-bottom: 1.5em;
`

const Note = styled.div`
  color: ${lighten('colorText', 0.2)};
  font-size: 75%;
`

const reportTypes = [
  'System',
  'Manuscript',
  'Handling editor',
  'Managing editor',
  'Reviewer',
  'Author',
]

const getDaysStringTo1Dp = valueDays => {
  const roundedDays = Math.round(valueDays * 10) / 10
  return `${roundedDays} day${roundedDays === 1 ? '' : 's'}`
}

const getReport = (
  reportType,
  startDate,
  endDate,
  getSystemData,
  getManuscriptsData,
  getHandlingEditorsData,
  getManagingEditorsData,
  getReviewersData,
  getAuthorsData,
) => {
  if (reportType === 'System') {
    const {
      avgPublishTimeDays,
      avgReviewTimeDays,
      unsubmittedCount,
      submittedCount,
      unassignedCount,
      reviewedCount,
      rejectedCount,
      revisingCount,
      acceptedCount,
      publishedCount,
    } = getSystemData(startDate, endDate)

    return (
      <Table
        headings={[]}
        rows={[
          [
            {
              content: (
                <div>
                  Average time to publish
                  <Note>From submission to published</Note>
                </div>
              ),
              isHeading: true,
            },
            { content: getDaysStringTo1Dp(avgPublishTimeDays) },
          ],
          [
            { content: 'Average time to review', isHeading: true },
            { content: getDaysStringTo1Dp(avgReviewTimeDays) },
          ],
          [
            { content: 'Unsubmitted', isHeading: true },
            { content: unsubmittedCount },
          ],
          [
            { content: 'Submitted', isHeading: true },
            { content: submittedCount },
          ],
          [
            { content: 'Unassigned', isHeading: true },
            { content: unassignedCount },
          ],
          [
            { content: 'Reviewed', isHeading: true },
            { content: reviewedCount },
          ],
          [
            { content: 'Rejected', isHeading: true },
            { content: rejectedCount },
          ],
          [
            { content: 'Awaiting revision', isHeading: true },
            { content: revisingCount },
          ],
          [
            { content: 'Accepted', isHeading: true },
            { content: acceptedCount },
          ],
          [
            { content: 'Published', isHeading: true },
            { content: publishedCount },
          ],
        ]}
        sizings={[{ width: '12em' }, { width: '7em' }]}
      />
    )
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
        rows={getHandlingEditorsData(startDate, endDate)}
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
        rows={getManagingEditorsData(startDate, endDate)}
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
        rows={getReviewersData(startDate, endDate)}
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
        rows={getAuthorsData(startDate, endDate)}
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
  getSystemData,
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
    <div>
      <Heading>Reports</Heading>
      <SelectionLine>
        Show{' '}
        <select
          defaultValue={reportTypes[0]}
          onChange={e => setReportType(e.target.value)}
          value={reportType}
        >
          {reportTypes.map(t => (
            <option key={t} label={t} value={t} />
          ))}
        </select>{' '}
        activity begun during date range{' '}
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
      {getReport(
        reportType,
        startDate,
        endDate,
        getSystemData,
        getManuscriptsData,
        getHandlingEditorsData,
        getManagingEditorsData,
        getReviewersData,
        getAuthorsData,
      )}
    </div>
  )
}

Report.propTypes = {
  getSystemData: PropTypes.func.isRequired,
  getManuscriptsData: PropTypes.func.isRequired,
  getHandlingEditorsData: PropTypes.func.isRequired,
  getManagingEditorsData: PropTypes.func.isRequired,
  getReviewersData: PropTypes.func.isRequired,
  getAuthorsData: PropTypes.func.isRequired,
}

export default Report
