import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'

const Heading = styled.h4``

const Container = styled.div`
  & > div {
    margin-bottom: 12px;
  }
`

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
/*
const filesToAttachment = file => ({
  name: file.name,
  url: file.storedObjects[0].url,
})
*/

const localizeReviewRecommendations = (jsonData, t) => {
  const clonedData = JSON.parse(JSON.stringify(jsonData))

  if (clonedData?.verdict) {
    clonedData.verdict = t(`reviewVerdict.${clonedData.verdict}`)
  }

  return clonedData
}

const Review = ({
  review,
  reviewForm,
  user,
  showEditorOnlyFields,
  showUserInfo = true,
  threadedDiscussionProps,
}) => {
  const { t } = useTranslation()
  let localizedData
  if (review) localizedData = localizeReviewRecommendations(review?.jsonData, t)
  return (
    <Container>
      {review && !review?.isHiddenReviewerName && showUserInfo && (
        <div>
          <Heading>
            <strong>{review.user.username}</strong>
          </Heading>
          {review.user.defaultIdentity.identifier}
        </div>
      )}

      {review?.isHiddenReviewerName && showUserInfo && (
        <div>
          <Heading>
            <strong style={{ color: '#545454' }}>
              {t('reviewPage.Anonymous Reviewer')}
            </strong>
          </Heading>
        </div>
      )}

      <ReadonlyFormTemplate
        form={reviewForm}
        formData={ensureJsonIsParsed(localizedData) ?? {}}
        hideSpecialInstructions
        showEditorOnlyFields={
          showEditorOnlyFields || user.groupRoles.includes('groupManager')
        }
        threadedDiscussionProps={threadedDiscussionProps}
      />
    </Container>
  )
}

Review.propTypes = {
  review: PropTypes.shape({}),
  user: PropTypes.shape({
    groupRoles: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }),
}

Review.defaultProps = {
  review: null,
  user: {
    groupRoles: [],
  },
}
export default Review
