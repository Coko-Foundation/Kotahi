import React from 'react'
import styled from 'styled-components'
import { Tabs } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import moment from 'moment'
import CurrentVersion from './CurrentVersion'
import DecisionReviewColumn from './DecisionReviewColumn'
import { Columns, SubmissionVersion } from './atoms/Columns'
import FormTemplate from './FormTemplate'
import { Container, Content } from '../../../shared'

const SubmittedVersionColumns = props => (
  <Container>
    <Columns>
      <SubmissionVersion>
        <CurrentVersion
          forms={props.forms}
          journal={props.journal}
          manuscript={props.manuscript}
          readonly
        />
        ,
      </SubmissionVersion>
      <DecisionReviewColumn {...props} />
    </Columns>
  </Container>
)

const Submit = ({ journal, manuscript, forms, ...formProps }) => {
  const decisionSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []
  manuscriptVersions.forEach(versionElem => {
    const submittedMoment = moment(versionElem.submitted)
    const label = submittedMoment.format('YYYY-MM-DD')
    decisionSections.push({
      content: (
        <SubmittedVersionColumns
          forms={forms}
          journal={journal}
          manuscript={versionElem}
        />
      ),
      key: versionElem.id,
      label,
    })
  })

  decisionSections.push({
    content: (
      <Content>
        <FormTemplate
          {...formProps}
          form={forms}
          journal={journal}
          manuscript={manuscript}
        />
      </Content>
    ),
    key: manuscript.id,
    label: 'Current Version',
  })

  return (
    <Container>
      <Tabs
        activeKey={manuscript.id}
        sections={decisionSections}
        title="Versions"
      />
    </Container>
  )
}

export default Submit
