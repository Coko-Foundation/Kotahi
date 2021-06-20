import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Report from './Report'
import {
  generateSummaryData,
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  // generateAuthorsData,
} from './mockReportingData'
import { Spinner } from '../../shared'

const getAuthorsReportData = gql`
  query authorsReportData($startDate: DateTime, $endDate: DateTime) {
    activeAuthors(startDate: $startDate, endDate: $endDate) {
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

const ReportPage = () => {
  const { data, loading, error } = useQuery(getAuthorsReportData, {
    variables: {
      startDate: 0,
      endDate: 0,
    },
  })

  if (loading) return <Spinner />
  if (error) return <div>{error}</div>

  return (
    <Report
      getAuthorsData={() => removeTypeName(data?.activeAuthors)}
      getHandlingEditorsData={generateEditorsData}
      getManagingEditorsData={generateEditorsData}
      getManuscriptsData={generateResearchObjectsData}
      getReviewersData={generateReviewersData}
      getSummaryData={generateSummaryData}
    />
  )
}

export default ReportPage
