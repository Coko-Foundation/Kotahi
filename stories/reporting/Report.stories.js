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

const endDate = Date.now()
const startDate = endDate - 30 * 24 * 60 * 60 * 1000

Base.args = {
  startDate,
  endDate,
  setStartDate: () => {},
  setEndDate: () => {},
  getSummaryData: () => generateSummaryData(startDate, endDate),
  getManuscriptsData: generateResearchObjectsData,
  getEditorsData: generateEditorsData,
  getReviewersData: generateReviewersData,
  getAuthorsData: generateAuthorsData,
}

export default {
  title: 'Reporting/Report',
  component: Report,
}
