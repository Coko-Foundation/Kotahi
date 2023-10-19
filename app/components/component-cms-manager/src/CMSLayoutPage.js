import React, { useState } from 'react'
import { Formik } from 'formik'
import { useMutation, useQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import LayoutForm from './layout/LayoutForm'
import { Container, Spinner, CommsErrorBanner } from '../../shared'
import PageHeader from './components/PageHeader'

import {
  getCMSLayout,
  updateCMSLayoutMutation,
  updateCMSPageDataMutation,
  rebuildFlaxSiteMutation,
  createFileMutation,
  deleteFileMutation,
} from './queries'

const CMSLayoutPage = ({ history }) => {
  const { loading, data, error } = useQuery(getCMSLayout)
  const [updateCMSLayout] = useMutation(updateCMSLayoutMutation)
  const [updateCMSPageInfo] = useMutation(updateCMSPageDataMutation)
  const [rebuildFlaxSite] = useMutation(rebuildFlaxSiteMutation)
  const [createFile] = useMutation(createFileMutation)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const { t } = useTranslation()

  const [submitButtonText, setSubmitButtonText] = useState(
    t('cmsPage.layout.Publish'),
  )

  const triggerAutoSave = async formData => {
    updateCMSLayout({
      variables: {
        input: { ...formData, edited: new Date() },
      },
    })
  }

  const onHeaderPageOrderChanged = updatedHeaderInfo => {
    updatePageOrderInfo(updatedHeaderInfo, 'flaxHeaderConfig')
  }

  const onFooterPageOrderChanged = updatedHeaderInfo => {
    updatePageOrderInfo(updatedHeaderInfo, 'flaxFooterConfig')
  }

  const updatePageOrderInfo = (pageOrderInfo, key) => {
    pageOrderInfo.forEach(cmsPage => {
      const { id, sequenceIndex, shownInMenu } = cmsPage
      updateCMSPageInfo({
        variables: {
          id,
          input: {
            [key]: {
              sequenceIndex,
              shownInMenu,
            },
          },
        },
      })
    })
  }

  const publish = async formData => {
    setSubmitButtonText(t('cmsPage.layout.Saving data'))
    await updateCMSLayout({
      variables: {
        input: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          logoId: formData.logoId,
          partners: formData.partners,
          footerText: formData.footerText,
          published: new Date(),
        },
      },
    })

    setSubmitButtonText(t('cmsPage.layout.Rebuilding Site'))
    await rebuildFlaxSite({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonText(t('cmsPage.layout.Published'))
  }

  const setInitialData = cmsLayoutData => {
    let initialData = {}
    const currentPartners = cmsLayoutData.partners || []
    const partnerData = currentPartners.filter(partner => partner != null)
    initialData = { ...cmsLayoutData }
    initialData.partners = partnerData.map(
      ({ file, ...restProps }) => restProps, // removing the file object
    )
    // to show the existing image
    initialData.logo = cmsLayoutData.logo ? [cmsLayoutData.logo] : []
    initialData.partnerFiles = partnerData.map(partner => partner.file)
    return initialData
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />
  if (!data.cmsLayout) return <CommsErrorBanner error={error} />

  const { cmsLayout } = data

  return (
    <Container>
      <PageHeader
        history={history}
        leftSideOnly
        mainHeading={t('cmsPage.layout.Layout')}
      />
      <Formik
        initialValues={setInitialData(cmsLayout)}
        onSubmit={async values => publish(values)}
      >
        {formikProps => {
          return (
            <LayoutForm
              cmsLayout={cmsLayout}
              createFile={createFile}
              deleteFile={deleteFile}
              formikProps={formikProps}
              onFooterPageOrderChanged={onFooterPageOrderChanged}
              onHeaderPageOrderChanged={onHeaderPageOrderChanged}
              submitButtonText={submitButtonText}
              triggerAutoSave={triggerAutoSave}
            />
          )
        }}
      </Formik>
    </Container>
  )
}

export default CMSLayoutPage
