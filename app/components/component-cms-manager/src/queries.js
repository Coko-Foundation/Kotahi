import { gql } from '@apollo/client'

const cmsPageFields = `
    id
    content
    created
    meta
    shortcode
    url
    status
    title
    updated
    published
    edited
    creator {
      id
      username
    }
`

export const getCMSPages = gql`
  query cmsPages {
    cmsPages {
      ${cmsPageFields}
    }
  }
`

export const getCMSPage = gql`
  query cmsPage($id: ID!) {
    cmsPage(id: $id) {
      ${cmsPageFields}
    }
  }
`

export const getCMSPageByShortcode = gql`
  query cmsPageByShortcode($shortcode: String!) {
    cmsPageByShortcode(shortcode: $shortcode) {
      ${cmsPageFields}
    }
  }
`

export const updateCMSPageDataMutation = gql`
  mutation updateCMSPage($id: ID!, $input: CMSPageInput!) {
    updateCMSPage(id: $id, input: $input) {
        ${cmsPageFields}
    }
  }
`

export const rebuildFlaxSiteMutation = gql`
  mutation rebuildFlaxSite {
    rebuildFlaxSite {
      status
      error
    }
  }
`
