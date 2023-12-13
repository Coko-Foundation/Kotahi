import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Icon } from '@pubsweet/ui/dist/atoms'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'
import { SectionHeader, Title } from '../style'
import { SectionContent } from '../../../../shared'

const Heading = styled.h4``

const Container = styled.div`
  & > div {
    margin-bottom: 12px;
  }
`

const StyledStrong = styled.strong`
  color: #545454;
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
  sharedReviews,
  isReview = false,
}) => {
  const { t } = useTranslation()
  let localizedData
  if (review) localizedData = localizeReviewRecommendations(review?.jsonData, t)

  const [open, setOpen] = useState(true)

  const renderContent = () => (
    <ReadonlyFormTemplate
      form={reviewForm}
      formData={ensureJsonIsParsed(localizedData) ?? {}}
      hideSpecialInstructions
      isReview={isReview}
      showEditorOnlyFields={
        showEditorOnlyFields || user.groupRoles.includes('groupManager')
      }
      threadedDiscussionProps={threadedDiscussionProps}
    />
  )

  return (
    <>
      {!sharedReviews ? (
        <Container>
          {review && !review?.isHiddenReviewerName && showUserInfo && (
            <div>
              <Heading>
                <strong>{review.user.username}</strong>
              </Heading>
              {review.user.defaultIdentity.identifier}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '-6px',
            }}
          >
            <Icon
              color="#9e9e9e"
              onClick={() => setOpen(prevOpen => !prevOpen)}
            >
              {open ? 'chevron-up' : 'chevron-down'}
            </Icon>

            {review?.isHiddenReviewerName && showUserInfo && (
              <section>
                <StyledStrong>
                  {t('reviewPage.Anonymous Reviewer')}
                </StyledStrong>
              </section>
            )}
          </div>

          {open && renderContent()}
        </Container>
      ) : (
        <SectionContent>
          <SectionHeader>
            <Title>{t('reviewPage.Anonymous Reviewer')}</Title>
          </SectionHeader>

          {open && renderContent()}
        </SectionContent>
      )}
    </>
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
