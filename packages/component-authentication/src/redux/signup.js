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
  user
})

export const signupFailure = error => ({
  type: SIGNUP_FAILURE,
  error
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
    }
  )
}

/* reducer */

const initialState = {
  isFetching: false,
  error: null,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SIGNUP_REQUEST:
      return {
        isFetching: true,
        error: null
      }

    case SIGNUP_SUCCESS:
      return {
        isFetching: false,
        error: null
      }

    case SIGNUP_FAILURE:
      return {
        isFetching: false,
        error: action.error
      }

    default:
      return state
  }
}
