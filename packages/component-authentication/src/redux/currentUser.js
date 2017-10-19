import * as api from 'pubsweet-client/src/helpers/api'

import { LOGOUT_SUCCESS } from './logout'

/* constants */

export const GET_CURRENT_USER_REQUEST = 'GET_CURRENT_USER_REQUEST'
export const GET_CURRENT_USER_SUCCESS = 'GET_CURRENT_USER_SUCCESS'
export const GET_CURRENT_USER_FAILURE = 'GET_CURRENT_USER_FAILURE'

/* actions */

export const getCurrentUserRequest = () => ({
  type: GET_CURRENT_USER_REQUEST
})

export const getCurrentUserSuccess = user => ({
  type: GET_CURRENT_USER_SUCCESS,
  user
})

export const getCurrentUserFailure = error => ({
  type: GET_CURRENT_USER_FAILURE,
  error
})

export const getCurrentUser = () => dispatch => {
  dispatch(getCurrentUserRequest())
  return api.get('/users/authenticate').then(
    user => {
      return dispatch(getCurrentUserSuccess(user))
    },
    error => {
      dispatch(getCurrentUserFailure(error))
      throw error
    }
  )
}

/* reducer */

const initialState = {
  isFetching: false,
  isFetched: false,
  isAuthenticated: false,
  user: null,
  error: null
}

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CURRENT_USER_REQUEST:
      return {
        isFetching: true,
        isFetched: false,
        isAuthenticated: false,
        user: null,
        error: null,
      }

    case GET_CURRENT_USER_FAILURE:
      return {
        isFetching: false,
        isFetched: true,
        isAuthenticated: false,
        user: null,
        error: action.error
      }

    case GET_CURRENT_USER_SUCCESS:
      return {
        isFetching: false,
        isFetched: true,
        isAuthenticated: true,
        user: action.user,
        error: null
      }

    // clear the current user on logout
    case LOGOUT_SUCCESS:
      return {
        isFetching: false,
        isFetched: false,
        isAuthenticated: false,
        user: null,
        error: null,
      }

    default:
      return state
  }
}
