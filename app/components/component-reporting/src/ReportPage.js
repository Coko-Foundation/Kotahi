import React, { useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import Report from './Report'
import { getStartOfDayUtc, getEndOfDayUtc } from './dateUtils'
import { Spinner, CommsErrorBanner } from '../../shared'

const getReportData = gql`
  query reportData(
    $startDate: DateTime
    $endDate: DateTime
    $timeZoneOffset: Int
  ) {
    summaryActivity(
      startDate: $startDate
      endDate: $endDate
      timeZoneOffset: $timeZoneOffset
    ) {
      avgPublishTimeDays
      avgReviewTimeDays
      unsubmittedCount
      submittedCount
      unassignedCount
      reviewInvitedCount
      reviewInviteAcceptedCount
      reviewedCount
      rejectedCount
      revisingCount
      acceptedCount
      publishedCount
      publishedTodayCount
      revisingNowCount
      avgPublishedDailyCount
      avgInProgressDailyCount
      durationsData {
        date
        reviewDuration
        fullDuration
      }
      reviewAvgsTrace {
        x
        y
      }
      completionAvgsTrace {
        x
        y
      }
    }
    manuscriptsActivity(startDate: $startDate, endDate: $endDate) {
      shortId
      entryDate
      title
      authors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      editors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      reviewers {
        id
        name
        status
      }
      status
      publishedDate
      versionReviewDurations
    }
    editorsActivity(startDate: $startDate, endDate: $endDate) {
      name
      assignedCount
      givenToReviewersCount
      revisedCount
      rejectedCount
      acceptedCount
      publishedCount
    }
    reviewersActivity(startDate: $startDate, endDate: $endDate) {
      name
      invitesCount
      declinedCount
      reviewsCompletedCount
      avgReviewDuration
      reccReviseCount
      reccAcceptCount
      reccRejectCount
    }
    authorsActivity(startDate: $startDate, endDate: $endDate) {
      name
      unsubmittedCount
      submittedCount
      rejectedCount
      revisionCount
      acceptedCount
      publishedCount
    }
  }
`

const removeTypeName = rows => {
  if (!rows) return []
  return rows.map(row => {
    const newRow = { ...row }
    // eslint-disable-next-line no-underscore-dangle
    delete newRow.__typename
    return newRow
  })
}

const defaultReportDuration = 31 * 24 * 60 * 60 * 1000 // 31 days

const ReportPage = () => {
  const [startDate, setStartDate] = useState(
    getStartOfDayUtc(Date.now() - defaultReportDuration).getTime(),
  )

  const [endDate, setEndDate] = useState(getEndOfDayUtc(Date.now()).getTime())

  const { data, loading, error } = useQuery(getReportData, {
    variables: {
      startDate,
      endDate,
      timeZoneOffset: new Date().getTimezoneOffset(),
    },
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Report
      endDate={endDate}
      getAuthorsData={() => removeTypeName(data?.authorsActivity)}
      getEditorsData={() => removeTypeName(data?.editorsActivity)}
      getManuscriptsData={() => removeTypeName(data?.manuscriptsActivity)}
      getReviewersData={() => removeTypeName(data?.reviewersActivity)}
      getSummaryData={() => data?.summaryActivity}
      setEndDate={setEndDate}
      setStartDate={setStartDate}
      startDate={startDate}
    />
  )
}

export default ReportPage
