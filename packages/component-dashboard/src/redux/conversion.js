import { actions } from 'pubsweet-client'
import { ink } from 'pubsweet-component-ink-frontend/actions'
import uploadFile from 'xpub-upload'
import { generateTitle, extractTitle } from '../lib/title'

/* constants */

export const UPLOAD_MANUSCRIPT_REQUEST = 'UPLOAD_MANUSCRIPT_REQUEST'
export const UPLOAD_MANUSCRIPT_SUCCESS = 'UPLOAD_MANUSCRIPT_SUCCESS'
export const UPLOAD_MANUSCRIPT_FAILURE = 'UPLOAD_MANUSCRIPT_FAILURE'
export const INITIAL_MANUSCRIPT = 'INITIAL_MANUSCRIPT'

/* actions */

export const uploadManuscriptRequest = () => ({
  type: UPLOAD_MANUSCRIPT_REQUEST,
})

export const uploadManuscriptSuccess = (collection, fragment) => ({
  collection,
  fragment,
  type: UPLOAD_MANUSCRIPT_SUCCESS,
})

export const uploadManuscriptFailure = error => ({
  error,
  type: UPLOAD_MANUSCRIPT_FAILURE,
})

export const uploadManuscript = (acceptedFiles, history) => dispatch => {
  if (acceptedFiles.length > 1) {
    throw new Error('Only one manuscript file can be uploaded')
  }

  const inputFile = acceptedFiles[0]

  dispatch(uploadManuscriptRequest())

  const request = dispatch(uploadFile(inputFile))

  request.addEventListener('load', event => {
    if (request.status >= 400) {
      throw new Error('There was an error uploading the file')
    }

    const fileURL = request.responseText

    dispatch(ink(inputFile, { recipe: 'editoria-typescript' }))
      .then(response => {
        if (!response.converted) {
          throw new Error('The file was not converted')
        }

        const source = response.converted
        const title = extractTitle(source) || generateTitle(inputFile.name)

        return dispatch(actions.createCollection({ title })).then(
          ({ collection }) => {
            if (!collection.id) {
              throw new Error('Failed to create a project')
            }

            // TODO: create teams?

            // TODO: rethrow errors so they can be caught here
            return dispatch(
              actions.createFragment(collection, {
                created: new Date(), // TODO: set on server
                files: {
                  manuscript: {
                    name: inputFile.name,
                    url: fileURL,
                  },
                  supplementary: [],
                },
                fragmentType: 'version',
                metadata: {
                  title,
                },
                source,
                version: 1,
              }),
            ).then(({ fragment }) => {
              dispatch(uploadManuscriptSuccess(collection, fragment))

              const route = `/projects/${collection.id}/versions/${
                fragment.id
              }/submit`
              // redirect after a short delay
              window.setTimeout(() => {
                dispatch({
                  type: INITIAL_MANUSCRIPT,
                })
                history.push(route)
              }, 2000)
            })
          },
        )
      })
      .catch(error => {
        console.error(error)
        dispatch(uploadManuscriptFailure(error))
        throw error // rethrow
      })
  })
}

/* reducer */

const initialState = {
  complete: false,
  converting: false,
  error: false,
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_MANUSCRIPT_REQUEST:
      return {
        complete: false,
        converting: true,
        error: undefined,
      }

    case INITIAL_MANUSCRIPT:
      return {
        complete: false,
        converting: false,
      }

    case UPLOAD_MANUSCRIPT_SUCCESS:
      return {
        complete: true,
        converting: false,
      }

    case UPLOAD_MANUSCRIPT_FAILURE:
      return {
        complete: false,
        converting: false,
        error: action.error,
      }

    default:
      return state
  }
}
