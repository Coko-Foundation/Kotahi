import { push } from 'react-router-redux'
import actions from 'pubsweet-client/src/actions'
import { ink as convertToHTML } from 'pubsweet-component-ink-frontend/actions'
import { generateTitle, extractTitle } from '../lib/title'

/* constants */

export const UPLOAD_MANUSCRIPT_REQUEST = 'UPLOAD_MANUSCRIPT_REQUEST'
export const UPLOAD_MANUSCRIPT_SUCCESS = 'UPLOAD_MANUSCRIPT_SUCCESS'
export const UPLOAD_MANUSCRIPT_FAILURE = 'UPLOAD_MANUSCRIPT_FAILURE'

/* actions */

export const uploadManuscriptRequest = () => ({
  type: UPLOAD_MANUSCRIPT_REQUEST
})

export const uploadManuscriptSuccess = (collection, fragment) => ({
  type: UPLOAD_MANUSCRIPT_SUCCESS,
  collection,
  fragment
})

export const uploadManuscriptFailure = error => ({
  type: UPLOAD_MANUSCRIPT_FAILURE,
  error
})

export const uploadManuscript = acceptedFiles => dispatch => {
  if (acceptedFiles.length > 1) {
    throw new Error('Only one manuscript file can be uploaded')
  }

  const inputFile = acceptedFiles[0]

  dispatch(uploadManuscriptRequest())

  dispatch(convertToHTML(inputFile)).then(response => {
    if (!response.converted) {
      throw new Error('The file was not converted')
    }

    const source = response.converted
    const title = extractTitle(source) || generateTitle(inputFile.name)

    return dispatch(actions.createCollection({
      type: 'project',
      title
    })).then(({ collection }) => {
      if (!collection.id) {
        throw new Error('Failed to create a project')
      }

      // TODO: create teams?
      // TODO: upload the manuscript file and attach it to the fragment

      return dispatch(actions.createFragment(collection, {
        type: 'version',
        version: 1,
        source,
        metadata: {
          title
        }
      })).then(({ fragment }) => {
        dispatch(uploadManuscriptSuccess(collection, fragment))

        const route = `/projects/${collection.id}/versions/${fragment.id}/submit`

        // redirect after a short delay
        window.setTimeout(() => {
          dispatch(push(route))
        }, 1000)
      })
    })
  }).catch(error => {
    console.error(error)
    dispatch(uploadManuscriptFailure(error))
    throw error // rethrow
  })
}

/* reducer */

const initialState = {
  converting: false,
  complete: undefined,
  error: undefined
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_MANUSCRIPT_REQUEST:
      return {
        converting: true,
        complete: false,
        error: undefined
      }

    case UPLOAD_MANUSCRIPT_SUCCESS:
      return {
        converting: false,
        complete: true,
      }

    case UPLOAD_MANUSCRIPT_FAILURE:
      return {
        converting: false,
        complete: false,
        error: action.error
      }

    default:
      return state
  }
}
