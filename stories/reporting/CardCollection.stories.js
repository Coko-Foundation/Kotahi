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
  margin-top: 1em;
  text-align: center;

  :first-child {
    margin-top: 0;
  }
`

const BigNumber = styled.div`
  font-size: 300%;
  line-height: 120%;
`

const NoteRight = styled.div`
  text-align: right;
  width: 100%;
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
        width: '150px',
      }}
    >
      <Header>Manuscripts published today</Header>
      <BigNumber>4</BigNumber>
      <NoteRight>Average 2</NoteRight>
      <Header>Manuscripts currently in revision</Header>
      <BigNumber>12</BigNumber>
      <NoteRight>Average 9</NoteRight>
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
  style: { width: 950, height: 600 },
}

export default {
  title: 'Reporting/CardCollection',
  component: CardCollection,
}
