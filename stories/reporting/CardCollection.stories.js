import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import {
  CardCollection,
  Card,
  ConcentricStepsChart,
  DurationsChart,
} from '../../app/components/component-reporting/src'
import {
  getEditorsConcentricBarChartData,
  getReviewersConcentricBarChartData,
} from './mockReportingData'

const Header = styled.div`
  color: ${th('colorPrimary')};
  font-size: 120%;
`

export const Base = args => (
  <CardCollection {...args}>
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Header>Editors&rsquo; workflow</Header>
      <ConcentricStepsChart {...getEditorsConcentricBarChartData()} />
    </Card>
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Header>Reviewers&rsquo; workflow</Header>
      <ConcentricStepsChart {...getReviewersConcentricBarChartData()} />
    </Card>
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Header>Submission durations</Header>
      <DurationsChart />
    </Card>
  </CardCollection>
)

Base.args = {
  style: { width: 800, height: 600 },
}

export default {
  title: 'Reporting/CardCollection',
  component: CardCollection,
}
