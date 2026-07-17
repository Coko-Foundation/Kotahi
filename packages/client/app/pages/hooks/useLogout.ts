import { useCallback } from 'react'
import { useApolloClient } from '@apollo/client/react'

export const useLogout = (): (() => void) => {
  const client = useApolloClient()

  return useCallback(() => {
    localStorage.removeItem('token')
    client.clearStore()
  }, [client])
}
