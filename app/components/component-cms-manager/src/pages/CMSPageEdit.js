import React, { useState } from 'react'

import { Formik } from 'formik'

import CMSPageEditForm from './CMSPageEditForm'

import { FullWidthAndHeightContainer } from '../style'

const CMSPageEdit = ({
  isNewPage,
  cmsPage,
  updatePageDataQuery,
  rebuildFlaxSiteQuery,
  createNewCMSPage,
  showPage,
  deleteCMSPage,
}) => {
  const [customFormErrors, setCustomFormErrors] = useState({})

  const [submitButtonState, setSubmitButtonState] = useState({
    state: null,
    text: 'Publish',
  })

  const autoSaveData = async (id, data) => {
    if (isNewPage) {
      return
    }

    const inputData = { ...data, edited: new Date() }
    await updatePageDataQuery({
      variables: { id, input: inputData },
    })
  }

  const publish = async formData => {
    setSubmitButtonState({ state: 'pending', text: 'Saving data' })
    const timeStamp = new Date()

    const inputData = {
      title: formData.title,
      content: formData.content,
      url: formData.url,
      published: timeStamp,
    }

    await updatePageDataQuery({
      variables: {
        id: cmsPage.id,
        input: inputData,
      },
    })

    setSubmitButtonState({ state: 'pending', text: 'Rebuilding...' })
    await rebuildFlaxSiteQuery({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonState({ state: 'success', text: 'Published' })
  }

  const createNewPage = async formData => {
    const inputData = {
      title: formData.title,
      content: formData.content,
      url: formData.url,
    }

    const newCMSPageResults = await createNewCMSPage({
      variables: {
        input: inputData,
      },
    })

    const newCmsPage = newCMSPageResults.data.createCMSPage

    if (newCmsPage.success) {
      return showPage(newCmsPage.cmsPage)
    }

    const errors = {}
    errors[newCmsPage.column] = newCmsPage.errorMessage
    setCustomFormErrors(errors)
    return true
  }

  const onDelete = async currentCMSPage => {
    await deleteCMSPage({
      variables: { id: currentCMSPage.id },
    })
    rebuildFlaxSiteQuery({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    showPage({ id: '' })
  }

  const resetCustomErrors = () => setCustomFormErrors({})

  return (
    <FullWidthAndHeightContainer>
      <FullWidthAndHeightContainer>
        <Formik
          initialValues={{
            title: cmsPage.title || '',
            content: cmsPage.content || '',
            url: cmsPage.url || '',
          }}
          onSubmit={async values =>
            isNewPage ? createNewPage(values) : publish(values)
          }
        >
          {formikProps => {
            return (
              <CMSPageEditForm
                autoSaveData={autoSaveData}
                cmsPage={cmsPage}
                currentValues={formikProps.values}
                customFormErrors={customFormErrors}
                isNewPage={isNewPage}
                onDelete={onDelete}
                onSubmit={formikProps.handleSubmit}
                resetCustomErrors={resetCustomErrors}
                setFieldValue={formikProps.setFieldValue}
                setTouched={formikProps.setTouched}
                submitButtonText={isNewPage ? 'Save' : submitButtonState.text}
              />
            )
          }}
        </Formik>
      </FullWidthAndHeightContainer>
    </FullWidthAndHeightContainer>
  )
}

export default CMSPageEdit
