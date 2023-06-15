import React, { useState } from 'react'

import { Formik } from 'formik'

import CMSPageEditForm from './CMSPageEditForm'

import PageHeader from '../components/PageHeader'
import { FullWidthANDHeight } from '../style'

const CMSPageEdit = ({
  cmsPage,
  updatePageDataQuery,
  rebuildFlaxSiteQuery,
}) => {
  const [submitButtonState, setSubmitButtonState] = useState({
    state: null,
    text: 'Publish',
  })

  const saveData = async (id, data) => {
    const inputData = { ...data, edited: new Date() }
    updatePageDataQuery({
      variables: { id, input: inputData },
    })
  }

  const publish = async formData => {
    setSubmitButtonState({ state: 'pending', text: 'Saving data' })
    const meta = JSON.parse(cmsPage.meta)
    const timeStamp = new Date()

    const inputData = {
      title: formData.title,
      content: formData.content,
      url: formData.url,
      meta: JSON.stringify({ ...meta, url: formData.url }),
      published: timeStamp,
    }

    await updatePageDataQuery({
      variables: {
        id: cmsPage.id,
        input: inputData,
      },
    })

    setSubmitButtonState({ state: 'pending', text: 'Rebuilding...' })
    await rebuildFlaxSiteQuery()
    setSubmitButtonState({ state: 'success', text: 'Published' })
  }

  const meta = JSON.parse(cmsPage.meta)

  return (
    <FullWidthANDHeight>
      <PageHeader leftSideOnly mainHeading="Pages" />
      <FullWidthANDHeight>
        <Formik
          initialValues={{
            title: cmsPage.title,
            content: cmsPage.content,
            url: meta.url || '',
          }}
          onSubmit={async values => publish(values)}
        >
          {formikProps => {
            return (
              <CMSPageEditForm
                cmsPage={cmsPage}
                formErrors={formikProps.errors}
                onSubmit={formikProps.handleSubmit}
                saveData={saveData}
                setFieldValue={formikProps.setFieldValue}
                setTouched={formikProps.setTouched}
                submitButtonText={submitButtonState.text}
              />
            )
          }}
        </Formik>
      </FullWidthANDHeight>
    </FullWidthANDHeight>
  )
}

export default CMSPageEdit
