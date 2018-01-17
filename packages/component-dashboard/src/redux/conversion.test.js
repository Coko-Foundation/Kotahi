import * as reducers from './conversion'

jest.mock('config', () => ({ 'pubsweet-client': {} }))

describe('default reducer', () => {
  it('updates state', () => {
    const initialState = { converting: false, error: undefined }

    const newState = reducers.default(initialState, {
      type: reducers.UPLOAD_MANUSCRIPT_REQUEST,
    })

    expect(newState).toEqual({ converting: true, error: undefined })
  })
})
