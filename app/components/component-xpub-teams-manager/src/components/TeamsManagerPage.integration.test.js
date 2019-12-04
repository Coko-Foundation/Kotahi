import React from 'react'
import faker from 'faker'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'

import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { ThemeProvider } from 'styled-components'
import queries from './graphql/queries'

import TeamsManagerPage from './TeamsManagerPage'

import TeamsManager from './TeamsManager'
import TeamCreator from './TeamCreator'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({
  'pubsweet-client': {},
  authsome: {
    mode: 'authsome',
    teams: {
      seniorEditor: {
        name: 'Senior Editors',
        permissions: '',
      },
      handlingEditor: {
        name: 'Handling Editors',
        permissions: '',
      },
      managingEditor: {
        name: 'Managing Editors',
        permissions: '',
      },
      reviewer: {
        name: 'Reviewer',
        permissions: '',
      },
    },
  },
}))

// Mock out the API
jest.mock('pubsweet-client/src/helpers/api', () => ({
  get: jest.fn(url => {
    // Whatever the request is, return an empty array
    const response = []
    return new Promise(resolve => resolve(response))
  }),
}))

jest.mock('pubsweet-client/src/helpers/Authorize', () => 'Authorize')

global.window.localStorage = {
  getItem: jest.fn(() => 'tok123'),
}

const mocks = [
  {
    request: {
      query: queries.teamManager,
    },
    result: {
      data: {
        currentUser: { id: faker.random.uuid(), username: 'test', admin: true },
        teams: [],
        users: [],
        manuscripts: [],
      },
    },
  },
]

describe('TeamsManagerPage', () => {
  it('runs', done => {
    const page = mount(
      <MemoryRouter>
        <ThemeProvider
          theme={{
            colorPrimary: 'blue',
            colorSecondary: '#E7E7E7',
          }}
        >
          <MockedProvider addTypename={false} mocks={mocks}>
            <TeamsManagerPage />
          </MockedProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    setImmediate(() => {
      page.update()
      expect(page.find(TeamsManager)).toHaveLength(1)
      expect(page.find(TeamCreator)).toHaveLength(1)
      done()
    })
  })
})
