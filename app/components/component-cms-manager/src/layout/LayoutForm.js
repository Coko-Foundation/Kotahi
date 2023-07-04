import React from 'react'

import { WidthLimiter, SectionContent, PaddedContent } from '../../../shared'

import { ActionButtonContainer, FormActionButton } from '../style'

import Header from './Header'
import Branding from './Branding'

const LayoutForm = ({
  formikProps,
  cmsLayout,
  submitButtonText,
  onHeaderInfoChanged,
  cmsPages,
  createFile,
  deleteFile,
}) => {
  const renderBranding = () => {
    return (
      <WidthLimiter>
        <SectionContent>
          <PaddedContent>
            <Branding
              cmsLayout={cmsLayout}
              createFile={createFile}
              deleteFile={deleteFile}
              formikProps={formikProps}
            />
          </PaddedContent>
        </SectionContent>
      </WidthLimiter>
    )
  }

  const renderHeader = () => {
    return (
      <WidthLimiter>
        <SectionContent>
          <PaddedContent>
            <Header
              initialItems={cmsPages}
              onItemUpdated={onHeaderInfoChanged}
            />
          </PaddedContent>
        </SectionContent>
      </WidthLimiter>
    )
  }

  return (
    <div>
      {renderBranding()}
      {renderHeader()}
      <ActionButtonContainer>
        <div>
          <FormActionButton
            onClick={formikProps.handleSubmit}
            primary
            type="button"
          >
            {submitButtonText}
          </FormActionButton>
        </div>
      </ActionButtonContainer>
    </div>
  )
}

export default LayoutForm
