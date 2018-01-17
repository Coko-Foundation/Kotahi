import * as reducers from './conversion'

jest.mock('config', () => ({ 'pubsweet-client': {} }))

describe('Reducers', () => {
  it('Does something', () => {
    console.log(`Object.keys(reducers)`, Object.keys(reducers))
  })
})
