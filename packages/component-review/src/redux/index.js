import * as api from 'pubsweet-client/src/helpers/api'
import {
  GET_COLLECTION_SUCCESS,
  GET_FRAGMENT_SUCCESS,
} from 'pubsweet-client/src/actions/types'

export const MAKE_DECISION_REQUEST = 'MAKE_DECISION_REQUEST'
export const MAKE_DECISION_SUCCESS = 'MAKE_DECISION_SUCCESS'
export const MAKE_DECISION_FAILURE = 'MAKE_DECISION_FAILURE'

function makeDecisionRequest(project, version) {
  return {
    type: MAKE_DECISION_REQUEST,
    project,
    version,
  }
}

function makeDecisionSuccess(project, version, result) {
  return {
    type: MAKE_DECISION_SUCCESS,
    project,
    version,
    result,
  }
}

function makeDecisionFailure(project, version, error) {
  return {
    type: MAKE_DECISION_FAILURE,
    project,
    version,
    error,
  }
}

export function makeDecision(project, version) {
  return dispatch => {
    dispatch(makeDecisionRequest(project, version))

    return api
      .update('/make-decision', {
        projectId: project.id,
        versionId: version.id,
        decision: version.decision,
      })
      .then(result => {
        dispatch({
          type: GET_COLLECTION_SUCCESS,
          collection: result.project,
          receivedAt: Date.now(),
        })
        dispatch({
          type: GET_FRAGMENT_SUCCESS,
          fragment: result.version,
          receivedAt: Date.now(),
        })
        if (result.nextVersion) {
          dispatch({
            type: GET_FRAGMENT_SUCCESS,
            fragment: result.nextVersion,
            receivedAt: Date.now(),
          })
        }
        dispatch(makeDecisionSuccess(project, version, result))
      })
      .catch(error => dispatch(makeDecisionFailure(project, version, error)))
  }
}

const initialState = {}
export default (state = initialState, action) => {
  switch (action.type) {
    case MAKE_DECISION_REQUEST:
      return {}

    case MAKE_DECISION_SUCCESS:
      return {}

    case MAKE_DECISION_FAILURE:
      return { error: action.error }

    default:
      return state
  }
}
