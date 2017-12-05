import * as api from 'pubsweet-client/src/helpers/api'

import { LOGOUT_SUCCESS } from './logout'

/* constants */

export const GET_CURRENT_USER_REQUEST = 'GET_CURRENT_USER_REQUEST'
export const GET_CURRENT_USER_SUCCESS = 'GET_CURRENT_USER_SUCCESS'
export const GET_CURRENT_USER_FAILURE = 'GET_CURRENT_USER_FAILURE'

/* actions */

export const getCurrentUserRequest = () => ({
  type: GET_CURRENT_USER_REQUEST,
})

export const getCurrentUserSuccess = user => ({
  type: GET_CURRENT_USER_SUCCESS,
  user,
})

export const getCurrentUserFailure = error => ({
  error,
  type: GET_CURRENT_USER_FAILURE,
})

export const getCurrentUser = () => dispatch => {
  dispatch(getCurrentUserRequest())
  return api.get('/users/authenticate').then(
    user => dispatch(getCurrentUserSuccess(user)),
    error => {
      dispatch(getCurrentUserFailure(error))
      throw error
    },
  )
}

/* reducer */

const initialState = {
  error: null,
  isAuthenticated: false,
  isFetched: false,
  isFetching: false,
  user: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CURRENT_USER_REQUEST:
      return {
        error: null,
        isAuthenticated: false,
        isFetched: false,
        isFetching: true,
        user: null,
      }

    case GET_CURRENT_USER_FAILURE:
      return {
        error: action.error,
        isAuthenticated: false,
        isFetched: true,
        isFetching: false,
        user: null,
      }

    case GET_CURRENT_USER_SUCCESS:
      return {
        error: null,
        isAuthenticated: true,
        isFetched: true,
        isFetching: false,
        user: action.user,
      }

    // clear the current user on logout
    case LOGOUT_SUCCESS:
      return {
        error: null,
        isAuthenticated: false,
        isFetched: false,
        isFetching: false,
        user: null,
      }

    default:
      return state
  }
}
