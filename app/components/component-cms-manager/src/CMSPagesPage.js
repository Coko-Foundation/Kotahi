import React, { useContext } from 'react'

import { useMutation, useQuery } from '@apollo/client'

import { Spinner, CommsErrorBanner } from '../../shared'

import CMSPageEditForm from './pages/CMSPageEdit'

import CMSPageEditSidebar from './pages/CMSPageEditSidebar'

import { ConfigContext } from '../../config/src'

import { EditPageContainer, EditPageLeft, EditPageRight } from './style'

import {
  getCMSPages,
  updateCMSPageDataMutation,
  rebuildFlaxSiteMutation,
} from './queries'

const CMSPagesPage = ({ match, history }) => {
  const config = useContext(ConfigContext)
  const urlFrag = config.journal.metadata.toplevel_urlfragment

  const { loading, data, error } = useQuery(getCMSPages)

  const [updatePageDataQuery] = useMutation(updateCMSPageDataMutation)
  const [rebuildFlaxSiteQuery] = useMutation(rebuildFlaxSiteMutation)

  let currentCMSPageId = null

  if (match.params.pageId) {
    currentCMSPageId = match.params.pageId
  }

  const showPage = currentCMSPage => {
    const link = `${urlFrag}/admin/cms/pages/${currentCMSPage.id}`
    history.push(link)
    return true
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const { cmsPages } = data

  let cmsPage = cmsPages.length > 0 ? cmsPages[0] : null

  if (currentCMSPageId) {
    cmsPage = cmsPages.find(obj => {
      return obj.id === currentCMSPageId
    })
  }

  if (!cmsPage) {
    return <p>No CMS page found.</p>
  }

  return (
    <EditPageContainer>
      <EditPageLeft>
        <CMSPageEditSidebar
          cmsPages={cmsPages}
          currentCMSPage={cmsPage}
          onItemClick={selectedCmsPage => showPage(selectedCmsPage)}
        />
      </EditPageLeft>
      <EditPageRight>
        <CMSPageEditForm
          cmsPage={cmsPage}
          key={cmsPage.id}
          rebuildFlaxSiteQuery={rebuildFlaxSiteQuery}
          updatePageDataQuery={updatePageDataQuery}
        />
      </EditPageRight>
    </EditPageContainer>
  )
}

export default CMSPagesPage
