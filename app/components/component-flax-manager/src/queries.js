import { gql } from '@apollo/client'

const flaxPageFields = `
    id
    title
    created
    content {
        title
        header
        footer
        body
    }
`

export const getFlaxPages = gql`
  query FlaxPages {
    flaxPages {
      ${flaxPageFields}
    }
  }
`

export const getFlaxPage = gql`
  query flaxPage($id: ID) {
    flaxPage(id: $id) {
      ${flaxPageFields}
    }
  }
`

export const getFlaxPageByShortcode = gql`
  query flaxPageByShortcode($shortcode: String!) {
    flaxPageByShortcode(shortcode: $shortcode) {
      ${flaxPageFields}
    }
  }
`

export const updatePageDataMutation = gql`
  mutation updateFlaxPage($id: ID, $input: FlaxPageInput) {
    updateFlaxPage(id: $id, input: $input) {
        ${flaxPageFields}
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
