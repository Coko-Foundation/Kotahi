/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */

import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { Chart } from 'react-google-charts'
import { countBy } from 'lodash'
import i18next from 'i18next'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import reviewStatuses from '../../../../../config/journal/review-status'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'

const Root = styled.div`
  font-family: ${th('fontReviewer')};
  font-size: 0.9em;
  height: 6em;
  position: relative;
  width: 6em;

  .google-visualization-tooltip {
    pointer-events: none;
  }
`

const chartOptions = {
  pieHole: 0.5,
  pieSliceText: 'none',
  legend: 'none',
  chartArea: {
    width: '100%',
    height: '80%',
  },
  tooltip: {
    isHtml: true,
    ignoreBounds: true,
  },
  is3D: false,
  width: '100%',
  height: '100%',
}

const CenterLabel = styled.div`
  font-size: ${th('fontSizeBase')};
  left: 50%;
  pointer-events: none;
  position: absolute;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
`

const invitationStatusMapping = {
  UNANSWERED: 'invited',
  REJECTED: 'rejected',
}

const header = [
  { type: 'string', id: 'Status' },
  { type: 'number', id: 'Count' },
  { type: 'string', role: 'tooltip', p: { html: true } },
]

// TODO Refactor to use recharts instead of react-google-charts
const ReviewStatusDonut = ({ manuscript }) => {
  const statusOptions = {}

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    i18next.t,
  )

  LocalizedReviewFilterOptions.forEach(item => {
    statusOptions[item.value] = { text: item.label, color: item.color }
  })

  const reviewerStatuses = getMembersOfTeam(manuscript, 'reviewer').map(
    ({ status }) => status,
  )

  const invitationStatuses = (manuscript.invitations || [])
    .filter(({ status }) => status in invitationStatusMapping)
    .map(({ status }) => invitationStatusMapping[status])

  const allStatuses = [...reviewerStatuses, ...invitationStatuses]
  const statusCounts = countBy(allStatuses)
  const statusTooltips = {}
  Object.keys(statusCounts).forEach(status => {
    const count = statusCounts[status]
    const { text } = statusOptions[status]
    statusTooltips[
      status
    ] = `<div style="min-width: 10em; padding: 5px 15px; font-size: ${th(
      'fontSizeBase',
    )}; color: ${th('colorText')};">${text}: ${count}</div>`
  })

  const statusColors = Object.keys(statusCounts).map(
    status => statusOptions[status].color,
  )

  const data = [
    header,
    ...Object.keys(statusCounts).map(status => [
      statusOptions[status].text,
      statusCounts[status],
      statusTooltips[status],
    ]),
  ]

  const options = {
    ...chartOptions,
    colors: statusColors,
  }

  const totalStatusCount = allStatuses.length

  return totalStatusCount > 0 ? (
    <Root>
      <Chart chartType="PieChart" data={data} options={options} />
      <CenterLabel>
        {totalStatusCount > 9 ? '9+' : totalStatusCount}
      </CenterLabel>
    </Root>
  ) : (
    'N/A'
  )
}

export default ReviewStatusDonut
