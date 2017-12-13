import { get } from 'lodash'
import config from 'config'

const exclude = ['/logout', '/login', '/signup']

export default ({ location: { state } }) => {
  const redirect = get(config, ['pubsweet-client', 'login-redirect'], '/')

  return state && state.from && !exclude.includes[state.from.pathname]
    ? state.from.pathname
    : redirect
}
