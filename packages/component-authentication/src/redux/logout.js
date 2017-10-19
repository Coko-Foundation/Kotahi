/* constants */

export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'

/* actions */

export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS
})

export const logout = () => dispatch => {
  localStorage.removeItem('token')
  return dispatch(logoutSuccess())
}
