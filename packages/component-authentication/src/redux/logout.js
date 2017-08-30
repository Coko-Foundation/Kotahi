import { push } from 'react-router-redux'

/* constants */

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'

/* actions */

export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS
})

export const logout = redirectTo => dispatch => {
  localStorage.removeItem('token')
  dispatch(logoutSuccess())
  if (redirectTo) dispatch(push(redirectTo))
}
