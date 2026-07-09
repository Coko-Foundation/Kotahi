import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import CardGrid from '../../shared/CardGrid'
import Page from '../../shared/Page'
import PageDescription from '../../shared/PageDescription'

const CMS = (): ReactNode => {
  const { groupName } = useParams()
  const { t } = useTranslation()

  return (
    <Page title={t('leftMenu.CMS')}>
      <PageDescription>{t('cmsIndexPage.description')}</PageDescription>
      <CardGrid
        items={[
          {
            title: t('cmsIndexPage.pagesTitle'),
            description: t('cmsIndexPage.pagesDescription'),
            url: `/${groupName}/admin/cms/pages`,
            key: 'pages',
          },
          {
            title: t('cmsIndexPage.layoutTitle'),
            description: t('cmsIndexPage.layoutDescription'),
            url: `/${groupName}/admin/cms/layout`,
            key: 'layout',
          },
          {
            title: t('cmsIndexPage.articleTitle'),
            description: t('cmsIndexPage.articleDescription'),
            url: `/${groupName}/admin/cms/article`,
            key: 'article',
          },
          {
            title: t('cmsIndexPage.metadataTitle'),
            description: t('cmsIndexPage.metadataDescription'),
            url: `/${groupName}/admin/cms/metadata`,
            key: 'metadata',
          },
          {
            title: t('cmsIndexPage.fileBrowserTitle'),
            description: t('cmsIndexPage.fileBrowserDescription'),
            url: `/${groupName}/admin/cms/filebrowser`,
            key: 'filebrowser',
          },
          {
            title: t('cmsIndexPage.collectionsTitle'),
            description: t('cmsIndexPage.collectionsDescription'),
            url: `/${groupName}/admin/cms/collections`,
            key: 'collections',
          },
        ]}
      />
    </Page>
  )
}

export default CMS
