import * as api from 'pubsweet-client/src/helpers/api'
import { getCurrentUser } from './currentUser'

// TODO: This will break when rendered on a server
const localStorage = window.localStorage || undefined

/* constants */

export const LOGIN_REQUEST = 'LOGIN_REQUEST'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'

/* actions */

export const loginRequest = credentials => ({
  type: LOGIN_REQUEST,
})

export const loginSuccess = user => ({
  type: LOGIN_SUCCESS,
})

export const loginFailure = error => ({
  type: LOGIN_FAILURE,
  error,
})

export const login = credentials => dispatch => {
  dispatch(loginRequest())
  return api.create('/users/authenticate', credentials).then(
    user => {
      localStorage.setItem('token', user.token)
      dispatch(loginSuccess())
      return dispatch(getCurrentUser())
    },
    error => {
      dispatch(loginFailure(error))
      throw error
    },
  )
}

/* reducer */

const initialState = {
  isFetching: false,
  error: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        isFetching: true,
        error: null,
      }

    case LOGIN_SUCCESS:
      return {
        isFetching: false,
        error: null,
      }

    case LOGIN_FAILURE:
      return {
        isFetching: false,
        error: action.error,
      }

    default:
      return state
  }
}
