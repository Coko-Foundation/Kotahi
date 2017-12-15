import { get } from 'lodash'
import config from 'config'

const allowedRedirect = pathname =>
  ['/logout', '/login', '/signup'].indexOf(pathname) === -1

export default ({ location: { state } }) =>
  state && state.from && allowedRedirect(state.from.pathname)
    ? state.from.pathname
    : get(config, ['pubsweet-client', 'login-redirect'], '/')
