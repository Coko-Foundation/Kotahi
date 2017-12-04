import * as api from 'pubsweet-client/src/helpers/api'
import { login } from './login'

/* constants */

export const SIGNUP_REQUEST = 'SIGNUP_REQUEST'
export const SIGNUP_SUCCESS = 'SIGNUP_SUCCESS'
export const SIGNUP_FAILURE = 'SIGNUP_FAILURE'

/* actions */

export const signupRequest = () => ({
  type: SIGNUP_REQUEST,
})

export const signupSuccess = user => ({
  type: SIGNUP_SUCCESS,
  user,
})

export const signupFailure = error => ({
  error,
  type: SIGNUP_FAILURE,
})

export const signup = credentials => dispatch => {
  dispatch(signupRequest())
  return api.create('/users', credentials).then(
    user => {
      dispatch(signupSuccess(user))
      dispatch(login(credentials))
    },
    error => {
      dispatch(signupFailure(error))
      throw error
    },
  )
}

/* reducer */

const initialState = {
  error: null,
  isFetching: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return {
        error: null,
        isFetching: true,
      }

    case SIGNUP_SUCCESS:
      return {
        error: null,
        isFetching: false,
      }

    case SIGNUP_FAILURE:
      return {
        error: action.error,
        isFetching: false,
      }

    default:
      return state
  }
}
