import React from 'react'
import faker from 'faker'
import Enzyme, { mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import Adapter from 'enzyme-adapter-react-16'
import { ThemeProvider } from 'styled-components'
import gql from 'graphql-tag'

import FormProperties from '../components/FormProperties'
import FormBuilderLayout from '../components/FormBuilderLayout'
import FormBuilder from '../components/FormBuilder'
import noforms from './config/noforms.json'
import testforms from './config/test.json'

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
        getForms: noforms,
      },
    },
  },
]

describe('FormBuilder Layout', () => {
  const makeWrapper = (props = {}) =>
    mount(
      <MemoryRouter>
        <ThemeProvider
          theme={{
            colorPrimary: 'blue',
            colorSecondary: '#E7E7E7',
          }}
        >
          <MockedProvider addTypename={false} mocks={mocks}>
            <FormBuilderLayout {...props} />
          </MockedProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )

  it('shows just the create form tab', () => {
    const formbuilder = makeWrapper({
      properties: {
        type: 'form',
      },
      activeTab: 'new',
    })

    expect(
      formbuilder.find('[data-test-id="tab-container"]').children(),
    ).toHaveLength(1)

    expect(formbuilder.find(FormProperties).find('form').text()).toContain(
      'Create Form',
    )

    expect(formbuilder.find(FormProperties).at(1).find('form')).toHaveLength(0)
  })

  it('shows three tabs and make the first active', () => {
    const formbuilder = makeWrapper({
      properties: {
        type: 'form',
        properties: testforms[0],
      },
      activeTab: 0,
      getForms: testforms,
    })

    expect(
      formbuilder.find('[data-test-id="tab-container"]').children(),
    ).toHaveLength(3)

    expect(
      formbuilder.find(FormBuilder).find('BuilderElement').children(),
    ).toHaveLength(testforms[0].children.length)

    expect(formbuilder.find(FormProperties).at(0).find('form')).toHaveLength(1)
  })
})
