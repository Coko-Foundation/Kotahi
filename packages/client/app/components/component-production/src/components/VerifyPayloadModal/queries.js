import { gql } from '@apollo/client'

const CHECK_API_PAYLOAD = gql`
  query CheckApiPayload($id: String!, $api: String!) {
    checkApiPayload(id: $id, api: $api)
  }
`

export default CHECK_API_PAYLOAD
