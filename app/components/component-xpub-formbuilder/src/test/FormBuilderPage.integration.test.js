import React from 'react'
import faker from 'faker'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import gql from 'graphql-tag'

import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import { ThemeProvider } from 'styled-components'

import FormBuilderPage from '../components/FormBuilderPage'

import forms from './config/test.json'

import FormProperties from '../components/FormProperties'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => {
  const path = require('path')

  return {
    'pubsweet-client': {},
    'pubsweet-component-xpub-formbuilder': {
      path: path.resolve('../test/config'),
    },
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
  }
})

jest.mock('pubsweet-client/src/helpers/Authorize', () => 'Authorize')

global.window.localStorage = {
  getItem: jest.fn(() => 'tok123'),
}

const query = gql`
  query {
    currentUser {
      id
      username
      admin
    }

    getForms
  }
`

const mocks = [
  {
    request: {
      query,
    },
    result: {
      data: {
        currentUser: { id: faker.random.uuid(), username: 'test', admin: true },
        getForms: forms,
      },
    },
  },
]

describe('FormBuilderPage', () => {
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
            <FormBuilderPage />
          </MockedProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )

    setTimeout(() => {
      page.update()
      expect(page.find('#builder-element').children()).toHaveLength(
        forms[0].children.length,
      )
      expect(page.find(FormProperties)).toHaveLength(1)
      done()
    }, 1000)
  })
})
