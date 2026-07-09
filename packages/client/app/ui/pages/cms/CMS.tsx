import { type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import CardGrid from '../../shared/CardGrid'
import Page from '../../shared/Page'
import PageDescription from '../../shared/PageDescription'

const CMS = (): ReactNode => {
  const { groupName } = useParams()

  return (
    <Page title="CMS">
      <PageDescription>
        This is where you control your published website, separate from the
        internal editorial workflow. Manage static pages, site-wide layout and
        branding, the article template, publication metadata, and the files
        backing your site. Changes here go live on your published site.
      </PageDescription>
      <CardGrid
        items={[
          {
            title: 'Pages',
            description:
              'Manage what pages are available on your published website.',
            url: `/${groupName}/admin/cms/pages`,
            key: 'pages',
          },
          {
            title: 'Layout',
            description:
              "Control your website's colors, footer, logo and more.",
            url: `/${groupName}/admin/cms/layout`,
            key: 'layout',
          },
          {
            title: 'Article Template',
            description:
              'Control the strucure, styles and assets of the published article page.',
            url: `/${groupName}/admin/cms/article`,
            key: 'article',
          },
          {
            title: 'Publication Metadata',
            description:
              'Manage your journal name, ISSNs and contact information.',
            url: `/${groupName}/admin/cms/metadata`,
            key: 'metadata',
          },
          {
            title: 'File Browser',
            description:
              'View and edit all the files that will be included in your published website.',
            url: `/${groupName}/admin/cms/filebrowser`,
            key: 'filebrowser',
          },
          {
            title: 'Collections',
            description: 'Manage collections of articles.',
            url: `/${groupName}/admin/cms/collections`,
            key: 'collections',
          },
        ]}
      />
    </Page>
  )
}

export default CMS
