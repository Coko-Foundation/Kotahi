import React from 'react'
import { VerticalBar, FlexCenter, StatusInfoText, NewEditText } from '../style'
import { convertTimestampToDateTimeString } from '../../../../shared/dateUtils'

const CMSPageStatus = ({ cmsPage }) => {
  const isPublished = () => !!cmsPage.published

  const isEdited = () =>
    !cmsPage.published || cmsPage.published < cmsPage.edited

  return (
    <StatusInfoText>
      {isEdited() && (
        <FlexCenter>
          <NewEditText>New edits on page</NewEditText> <VerticalBar />
        </FlexCenter>
      )}
      <FlexCenter>
        Edited on {convertTimestampToDateTimeString(cmsPage.edited)}
        <VerticalBar />
      </FlexCenter>
      <FlexCenter>
        {isPublished()
          ? `Published on ${convertTimestampToDateTimeString(
              cmsPage.published,
            )}`
          : 'Not published yet'}
      </FlexCenter>
    </StatusInfoText>
  )
}

export default CMSPageStatus
