import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { combineReducers } from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { ThemeProvider } from 'styled-components'

import { reducers } from 'pubsweet-client'
import conversion from '../redux/conversion'

import DashboardPage from './DashboardPage'
import { Section, UploadContainer } from './molecules/Page'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({ 'pubsweet-client': {} }))

// Mock out the API
jest.mock('pubsweet-client/src/helpers/api', () => ({
  get: jest.fn(url => {
    // Whatever the request is, return an empty array
    const response = []
    return new Promise(resolve => resolve(response))
  }),
}))

global.window.localStorage = {
  getItem: jest.fn(() => 'tok123'),
}

reducers.conversion = conversion
const reducer = combineReducers(reducers)

const middlewares = [thunk]
const mockStore = () =>
  configureMockStore(middlewares)(actions =>
    actions.reduce(reducer, {
      currentUser: { isAuthenticated: true },
      conversion: { converting: false },
    }),
  )

describe('DashboardPage', () => {
  it('runs', done => {
    const store = mockStore()
    const page = mount(
      <MemoryRouter>
        <ThemeProvider theme={{ colorPrimary: 'blue' }}>
          <Provider store={store}>
            <DashboardPage />
          </Provider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    setImmediate(() => {
      page.update()
      expect(page.find(UploadContainer)).toHaveLength(2)
      expect(page.find(Section)).toHaveLength(0)
      done()
    })
  })
})
