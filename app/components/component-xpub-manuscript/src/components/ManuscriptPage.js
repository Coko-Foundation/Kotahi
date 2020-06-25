import { compose, withProps } from 'recompose'
import { graphql } from '@apollo/react-hoc'
import gql from 'graphql-tag'
import { withLoader } from 'pubsweet-client'

import Manuscript from './Manuscript'

const fragmentFields = `
  id
  created
  status
  files {
    id
    fileType
    mimeType
  }
  meta {
    title
    source
  }
  channels {
    id
    type
  }
`

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

    manuscript(id: $id) {
      ${fragmentFields}
    }
  }
`

export default compose(
  graphql(query, {
    options: ({ match }) => ({
      variables: {
        id: match.params.version,
      },
    }),
  }),
  withLoader(),
  withProps(({ manuscript }) => ({
    content: manuscript.meta.source,
    file: manuscript.files.find(file => file.fileType === 'manuscript') || {},
    channel: manuscript.channels.find(c => (c.type = 'all')),
  })),
)(Manuscript)
