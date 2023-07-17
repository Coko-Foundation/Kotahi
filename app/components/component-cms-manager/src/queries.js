import { gql } from '@apollo/client'

const fileFields = `
    id
    name
    tags
    storedObjects {
      mimetype
      key
      url
      type
    }
`

const flaxPageConfigFields = `
    id
    title
    sequenceIndex
    shownInMenu
    url
`

const cmsPageFields = `
    id
    content
    created
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

const cmsLayoutFields = `
    id
    created
    updated
    primaryColor
    secondaryColor
    footerText
    published
    edited
    flaxHeaderConfig {
      ${flaxPageConfigFields}
    }
    flaxFooterConfig {
      ${flaxPageConfigFields}
    }
    partners {
      id
      url
      sequenceIndex
      file {
       ${fileFields}
      }
    }
    logo {
      ${fileFields}
    }
 
`

const createCmsPageFields = `
    cmsPage {
      id
      url
      content
    }
    success
    error
    column
    errorMessage
`

const deleteCmsPageFields = `
    success
    error
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

export const createCMSPageMutation = gql`
  mutation createCMSPage($input: CMSPageInput!) {
    createCMSPage(input: $input) {
      ${createCmsPageFields}
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

export const deleteCMSPageMutation = gql`
  mutation deleteCMSPage($id: ID!) {
    deleteCMSPage(id: $id) {
        ${deleteCmsPageFields}
    }
  }
`
export const rebuildFlaxSiteMutation = gql`
  mutation rebuildFlaxSite($params: String) {
    rebuildFlaxSite(params: $params) {
      status
      error
    }
  }
`

export const getCMSLayout = gql`
  query cmsLayout {
    cmsLayout {
      ${cmsLayoutFields}
    }
  }
`

export const updateCMSLayoutMutation = gql`
  mutation updateCMSLayout($input: CMSLayoutInput!) {
    updateCMSLayout(input: $input) {
      ${cmsLayoutFields}
    }
  }
`

export const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

export const deleteFileMutation = gql`
  mutation($id: ID!) {
    deleteFile(id: $id)
  }
`
