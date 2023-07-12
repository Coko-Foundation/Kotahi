import React, { useState } from 'react'
import { Formik } from 'formik'
import { useMutation, useQuery } from '@apollo/client'
import LayoutForm from './layout/LayoutForm'
import { Container, Spinner, CommsErrorBanner } from '../../shared'
import PageHeader from './components/PageHeader'

import {
  getCMSLayout,
  updateCMSLayoutMutation,
  getCMSPages,
  updateCMSPageDataMutation,
  rebuildFlaxSiteMutation,
  createFileMutation,
  deleteFileMutation,
} from './queries'

const CMSLayoutPage = ({ history }) => {
  const {
    data: cmsPagesData,
    refetch: refetchCMSPages,
    loading: loadingCmsPages,
  } = useQuery(getCMSPages)

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

  const [submitButtonText, setSubmitButtonText] = useState('Save')
  let headerInfo = []

  const onHeaderInfoChanged = updatedHeaderInfo => {
    headerInfo = updatedHeaderInfo
  }

  const onSubmitLayoutForm = async formData => {
    setSubmitButtonText('Updating branding')
    await updateCMSLayout({
      variables: {
        input: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          logoId: formData.logoId,
        },
      },
    })

    if (headerInfo.length > 0) {
      setSubmitButtonText('Updating Header')
      headerInfo.forEach(cmsPage => {
        const { id, sequenceIndex, menu } = cmsPage
        updateCMSPageInfo({
          variables: {
            id,
            input: {
              sequenceIndex,
              menu,
            },
          },
        })
      })
    }

    setSubmitButtonText('Rebuilding Site...')
    await rebuildFlaxSite({
      variables: {
        params: JSON.stringify({
          path: 'pages',
        }),
      },
    })
    setSubmitButtonText('Saved')
  }

  if (loading || loadingCmsPages) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { cmsLayout } = data
  const { cmsPages } = cmsPagesData
  let initialData = {}

  if (cmsLayout) {
    initialData = { ...cmsLayout }
    // to show the existing image
    initialData.logo = cmsLayout.logo ? [cmsLayout.logo] : []
  }

  return (
    <Container>
      <PageHeader history={history} leftSideOnly mainHeading="Layout" />
      <Formik
        initialValues={initialData}
        onSubmit={async values => onSubmitLayoutForm(values)}
      >
        {formikProps => {
          return (
            <LayoutForm
              cmsLayout={cmsLayout}
              cmsPages={cmsPages}
              createFile={createFile}
              deleteFile={deleteFile}
              formikProps={formikProps}
              onHeaderInfoChanged={onHeaderInfoChanged}
              refetchCMSPages={refetchCMSPages}
              submitButtonText={submitButtonText}
            />
          )
        }}
      </Formik>
    </Container>
  )
}

export default CMSLayoutPage
