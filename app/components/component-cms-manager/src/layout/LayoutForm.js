import React from 'react'

import { SectionContent, PaddedContent } from '../../../shared'
import { ActionButtonContainer, FormActionButton } from '../style'
import PublishStatus from '../components/PublishStatus'

import Header from './Header'
import Branding from './Branding'
import Footer from './Footer'

const LayoutForm = ({
  formikProps,
  cmsLayout,
  submitButtonText,
  onHeaderPageOrderChanged,
  onFooterPageOrderChanged,
  createFile,
  deleteFile,
  triggerAutoSave,
}) => {
  const renderBranding = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Branding
            cmsLayout={cmsLayout}
            createFile={createFile}
            deleteFile={deleteFile}
            formikProps={formikProps}
            triggerAutoSave={triggerAutoSave}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  const renderHeader = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Header
            cmsLayout={cmsLayout}
            onPageOrderUpdated={onHeaderPageOrderChanged}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  const renderFooter = () => {
    return (
      <SectionContent>
        <PaddedContent>
          <Footer
            cmsLayout={cmsLayout}
            createFile={createFile}
            deleteFile={deleteFile}
            formikProps={formikProps}
            onPageOrderUpdated={onFooterPageOrderChanged}
            triggerAutoSave={triggerAutoSave}
          />
        </PaddedContent>
      </SectionContent>
    )
  }

  return (
    <div>
      {renderBranding()}
      {renderHeader()}
      {renderFooter()}
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
        <PublishStatus cmsComponent={cmsLayout} />
      </ActionButtonContainer>
    </div>
  )
}

export default LayoutForm
