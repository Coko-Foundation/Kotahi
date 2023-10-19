import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import { Heading, Title, Icon } from '../../../../shared'
import { color } from '../../../../../theme'

const Page = styled.div`
  background: ${color.backgroundC};
  height: 100vh;
  overflow-y: scroll;
  padding: ${grid(2)};
`

const IconLink = styled.div`
  align-items: center;
  color: ${color.brand1.base};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  margin: ${grid(2)};
  width: fit-content;
`

const ReviewPreview = ({
  manuscript,
  submissionForm,
  threadedDiscussionProps,
}) => {
  const history = useHistory()
  const { t } = useTranslation()
  return (
    <Page>
      <Heading>{t('reviewPreviewPage.Summary')}</Heading>
      <Title>{manuscript.meta.title}</Title>
      <ReadonlyFormTemplate
        form={submissionForm}
        formData={{
          ...manuscript,
          submission: JSON.parse(manuscript.submission),
        }}
        hideSpecialInstructions
        manuscript={manuscript}
        showEditorOnlyFields={false}
        threadedDiscussionProps={threadedDiscussionProps}
      />
      <IconLink onClick={() => history.goBack()}>
        <Icon color={color.brand1.base()} inline size={2}>
          arrow-left
        </Icon>
        {t('reviewPreviewPage.Back')}
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
