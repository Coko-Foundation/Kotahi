import React from 'react'
import { Report } from '../../app/components/component-reporting/src'
import {
  generateSummaryData,
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  generateAuthorsData,
} from './mockReportingData'

export const Base = args => <Report {...args} />

Base.args = {
  getSummaryData: generateSummaryData,
  getManuscriptsData: generateResearchObjectsData,
  getHandlingEditorsData: generateEditorsData,
  getManagingEditorsData: generateEditorsData,
  getReviewersData: generateReviewersData,
  getAuthorsData: generateAuthorsData,
}

export default {
  title: 'Reporting/Report',
  component: Report,
}
