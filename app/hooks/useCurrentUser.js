import { useQuery } from '@apollo/client'

import { GET_CURRENT_USER } from '../queries'

export default function useCurrentUser() {
  const { loading, error, data } = useQuery(GET_CURRENT_USER)

  if (loading || error) {
    return null
  }

  if (data && data.currentUser) {
    return data.currentUser
  }

  return null
}
