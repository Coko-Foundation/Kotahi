import React from 'react'
import { VerticalBar, FlexCenter, StatusInfoText, NewEditText } from '../style'
import { convertTimestampToDateTimeString } from '../../../../shared/dateUtils'

const PublishStatus = ({ cmsComponent }) => {
  const isPublished = () => !!cmsComponent.published

  const isEdited = () =>
    !cmsComponent.published || cmsComponent.published < cmsComponent.edited

  return (
    <StatusInfoText>
      {isEdited() && (
        <FlexCenter>
          <NewEditText>New edits on page</NewEditText> <VerticalBar />
        </FlexCenter>
      )}
      <FlexCenter>
        Edited on {convertTimestampToDateTimeString(cmsComponent.edited)}
        <VerticalBar />
      </FlexCenter>
      <FlexCenter>
        {isPublished()
          ? `Published on ${convertTimestampToDateTimeString(
              cmsComponent.published,
            )}`
          : 'Not published yet'}
      </FlexCenter>
    </StatusInfoText>
  )
}

export default PublishStatus
