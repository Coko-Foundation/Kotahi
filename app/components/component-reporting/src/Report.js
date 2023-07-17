import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { forEach, map } from 'lodash'
import { Icon } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import DateRangePicker from './DateRangePicker'
import SummaryReport from './SummaryReport'
import Table from './Table'
import SparkBar from './SparkBar'
import Tooltip from './Tooltip'
import { color } from '../../../theme'

const Page = styled.div`
  height: 100vh;
  overflow-y: auto;
  padding: 0 ${grid(2)} ${grid(3)} ${grid(2)};
`

const Select = styled.select`
  border: 1px solid ${th('colorBorder')};
  padding: 5px;
`

const Heading = styled.div`
  color: ${color.brand1.base};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: ${th('gridUnit')} 0;
`

const MinorNote = styled.span`
  color: ${color.gray50};
  font-size: 80%;
`

export const Content = styled.div`
  background-color: ${color.backgroundC};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const SelectionLine = styled.div`
  margin-bottom: 1.5em;
  position: relative;
  z-index: 3;
`

const ReviewNote = styled.div`
  color: ${color.gray50};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  & strong {
    color: ${color.text};
    font-weight: normal;
  }
`

const CompletedIcon = () => (
  <div
    data-testid="completed-svg"
    style={{ display: 'inline-block' }}
    title="Completed"
  >
    <div
      style={{
        width: '0.3em',
        overflowX: 'visible',
        display: 'inline-block',
      }}
    >
      <Icon color="green" key="com" size={2}>
        check
      </Icon>
    </div>
    <Icon color="darkgreen" key="com" size={2}>
      check
    </Icon>
  </div>
)

const InvitedIcon = () => (
  <span data-testid="invited-svg">
    <Icon color="cornflowerblue" key="inv" size={2} title="Invited">
      send
    </Icon>
  </span>
)

const AcceptedIcon = () => (
  <span data-testid="accepted-svg">
    <Icon color="lightgreen" key="inv" size={2} title="Accepted">
      check
    </Icon>
  </span>
)

const RejectedIcon = () => (
  <span data-testid="rejected-svg">
    <Icon color="darkred" key="inv" size={2} title="Declined">
      slash
    </Icon>
  </span>
)

const InProgressIcon = () => (
  <span data-testid="inProgress-svg">
    <Icon color="cornflowerblue" key="edit" size={2} title="In Progress">
      edit
    </Icon>
  </span>
)

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
          color={color.brand2.tint70()}
          label={labelMapper && labelMapper(val, key)}
          onClick={undefined}
          rangeMax={columnMaxima[key]}
          value={val}
        />
      )
    }),
  )
}

const ReviewerNamesWithStatuses = ({ reviewers }) => {
  if (reviewers.length <= 0) return null
  return (
    <div>
      {reviewers.map((r, i) => (
        <span data-testid="reviewer-record" key={r.name}>
          {i > 0 ? `, ${r.name}` : r.name}
          {r.status === 'invited' && <InvitedIcon />}
          {r.status === 'accepted' && <AcceptedIcon />}
          {r.status === 'rejected' && <RejectedIcon />}
          {r.status === 'inProgress' && <InProgressIcon />}
          {r.status === 'completed' && <CompletedIcon />}
        </span>
      ))}
    </div>
  )
}

/** Returns text like "Review took 1 day" or "Reviews took 3.1, 2.2 days"
 * or if a review is still in progress, "Previous reviews took 1.2, 2.3 days". If no reviews are completed yet, returns null.
 * The numbers themselves are displayed in &lt;strong&gt;&lt;/strong&gt;. */
const ReviewDurations = ({ durations }) => {
  const isCurrentlyReviewing =
    durations.length > 0 && durations[durations.length - 1] === null

  const completedDurations = isCurrentlyReviewing
    ? durations.slice(0, durations.length - 1)
    : durations

  if (completedDurations.length <= 0) return null

  return (
    <ReviewNote>
      {isCurrentlyReviewing ? 'Previous review' : 'Review'}
      {completedDurations.length > 1 ? 's' : ''} took{' '}
      <strong>
        {completedDurations.map(d => Math.round(d * 10) / 10).join(', ')}
      </strong>{' '}
      day
      {completedDurations.length > 1 || completedDurations[0] !== 1 ? 's' : ''}
    </ReviewNote>
  )
}

const renderReviewInfo = ({ reviewers, durations }) => {
  return (
    <>
      <ReviewerNamesWithStatuses reviewers={reviewers} />
      <ReviewDurations durations={durations} />
    </>
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
    const data = getManuscriptsData(startDate, endDate).map(d => ({
      shortId: d.shortId,
      entryDate: d.entryDate,
      title: d.title,
      authors: d.authors,
      editors: d.editors,
      reviews: { reviewers: d.reviewers, durations: d.versionReviewDurations },
      status: d.status,
      publishedDate: d.publishedDate,
    }))

    const rows = getTableDataWithSparkBars(data, (val, key) => {
      if (['editors', 'authors'].includes(key))
        return val
          .map(u => u.username || u.email || u.defaultIdentity.identifier)
          .join(', ')
      if (key === 'reviews') return renderReviewInfo(val)

      return val
    })

    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: 'Manuscript number', name: 'shortId', width: '6.5em' },
          { heading: 'Entry date', name: 'entryDate', width: '7em' },
          { heading: 'Title', name: 'title', width: '16em', flexGrow: 4 },
          { heading: 'Author', name: 'authors', width: '12em', flexGrow: 1 },
          { heading: 'Editors', name: 'editors', width: '12em', flexGrow: 3 },
          { heading: 'Reviewers', name: 'reviews', width: '14em', flexGrow: 3 },
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
      <SelectionLine data-testid="report-options">
        Show{' '}
        <Select
          onChange={e => setReportType(e.target.value)}
          value={reportType}
        >
          {reportTypes.map(t => (
            <option key={t} label={t} value={t} />
          ))}
        </Select>{' '}
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
  /** Start of range for reporting, ms since epoch */
  startDate: PropTypes.number.isRequired,
  /** End of range for reporting, ms since epoch */
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
