import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import {
  CardCollection,
  Card,
  ConcentricStepsChart,
} from '../../app/components/component-reporting/src'

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
      <ConcentricStepsChart />
    </Card>
    <Card>
      <ConcentricStepsChart />
    </Card>
    <Card>
      <ConcentricStepsChart />
    </Card>
    <Card>
      <ConcentricStepsChart />
    </Card>
  </CardCollection>
)

Base.args = {
  style: { width: 800, height: 800 },
}

export default {
  title: 'Reporting/CardCollection',
  component: CardCollection,
}
