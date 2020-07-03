import React from 'react'
import styled from 'styled-components'
import { Tabs } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import moment from 'moment'
import CurrentVersion from './CurrentVersion'
import DecisionReviewColumn from './DecisionReviewColumn'
import { Columns, SubmissionVersion } from './atoms/Columns'
import FormTemplate from './FormTemplate'

const Wrapper = styled.div`
  overflow-y: scroll;
  // font-family: ${th('fontInterface')};
  // line-height: 1.3;
  // margin: auto;
  // max-width: 60em;

  // overflow: ${({ confirming }) => confirming && 'hidden'};
`

const SubmittedVersionColumns = props => (
  <Wrapper>
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
  </Wrapper>
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
      <FormTemplate
        {...formProps}
        form={forms}
        journal={journal}
        manuscript={manuscript}
      />
    ),
    key: manuscript.id,
    label: 'Current Version',
  })

  return (
    <Wrapper>
      <Tabs
        activeKey={manuscript.id}
        sections={decisionSections}
        title="Versions"
      />
    </Wrapper>
  )
}

export default Submit
