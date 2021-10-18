import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { th, grid } from '@pubsweet/ui-toolkit'
import ReviewMetadata from '../metadata/ReviewMetadata'
import { Heading, Title, Icon } from '../../../../shared'

const Page = styled.div`
  background: ${th('colorBackgroundHue')};
  height: 100vh;
  overflow-y: scroll;
  padding: ${grid(2)};
`

const IconLink = styled.div`
  align-items: center;
  color: ${th('colorPrimary')};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  margin: ${grid(2)};
  width: fit-content;
`

const ReviewPreview = ({ manuscript, submissionForm }) => {
  const history = useHistory()
  return (
    <Page>
      <Heading>Summary</Heading>
      <Title>{manuscript.meta.title}</Title>
      <ReviewMetadata
        form={submissionForm}
        manuscript={manuscript}
        showEditorOnlyFields={false}
        showPreviewMetadataOnly
      />
      <IconLink onClick={() => history.goBack()}>
        <Icon color={th('colorPrimary')} inline size={2}>
          arrow-left
        </Icon>
        Back
      </IconLink>
    </Page>
  )
}

ReviewPreview.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  submissionForm: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
        includeInReveiwPreview: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default ReviewPreview
