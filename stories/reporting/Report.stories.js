import React from 'react'
import { Report } from '../../app/components/component-reporting/src'
import {
  generateSystemData,
  generateResearchObjectsData,
  generateEditorsData,
  generateReviewersData,
  generateAuthorsData,
} from './mockReportingData'

export const Base = args => <Report {...args} />

Base.args = {
  getSystemData: generateSystemData,
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
