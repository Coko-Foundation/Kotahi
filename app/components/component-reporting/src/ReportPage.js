import React from 'react'
import Report from './Report'
import {
  generateSummaryData,
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  generateAuthorsData,
} from './mockReportingData'

const ReportPage = () => (
  <Report
    getAuthorsData={generateAuthorsData}
    getHandlingEditorsData={generateEditorsData}
    getManagingEditorsData={generateEditorsData}
    getManuscriptsData={generateResearchObjectsData}
    getReviewersData={generateReviewersData}
    getSummaryData={generateSummaryData}
  />
)

export default ReportPage
