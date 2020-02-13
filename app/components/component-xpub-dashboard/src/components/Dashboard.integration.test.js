// This test is very incomplete and doesn't actually test all that much.
// Consider throwing it out, and replacing it with actual end to end integration tests.

import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import { ThemeProvider } from 'styled-components'
import { JournalProvider } from 'xpub-journal'
import Dashboard from './Dashboard'
import queries from '../graphql/queries'
import { UploadContainer } from './molecules/Page'
import OwnerItem from './sections/OwnerItem'
import ReviewerItem from './sections/ReviewerItem'
import EditorItem from './sections/EditorItem'

function waitABit() {
  return new Promise(resolve => setTimeout(resolve, 500))
}

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({
  'pubsweet-client': {},
  authsome: {
    mode: 'authsome',
  },
  'pubsweet-component-xpub-dashboard': {
    acceptUploadFiles: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-latex',
      'text/vnd.latex-z',
      'text/x-tex',
      'application/pdf',
      'application/epub+zip',
      'application/zip',
    ],
  },
}))

jest.mock('pubsweet-client/src/helpers/Authorize', () => 'div')

global.window.localStorage = {
  getItem: jest.fn(() => 'tok123'),
}

const journal = {
  reviewStatus: ['invited', 'accepted', 'rejected', 'completed'],
  articleTypes: [
    {
      label: 'Original Research Report',
      value: 'original-research',
    },
  ],
  articleSections: [
    {
      label: 'Cognitive Psychology',
      value: 'cognitive-psychology',
    },
  ],
}

const mockData = {
  currentUser: {
    id: '1',
    username: 'test',
    admin: true,
  },
  journals: {
    id: '2',
    title: 'Test Journal',
    manuscripts: [
      {
        id: '3',
        manuscriptVersions: [],
        reviews: [
          {
            open: null,
            recommendation: 'accepted',
            created: '2019-10-24T23:49:13.694Z',
            isDecision: false,
            user: {
              id: '1',
              username: 'test',
            },
          },
        ],
        teams: [
          {
            id: '4',
            role: 'author',
            type: 'team',
            name: 'Author',
            object: {
              objectId: '3',
              objectType: 'Manuscript',
            },
            members: [
              {
                id: '5',
                user: {
                  id: '1',
                  username: 'test',
                },
                status: null,
              },
            ],
          },
          {
            id: '6',
            role: 'reviewerEditor',
            type: 'team',
            name: 'Reviewer Editor',
            object: {
              objectId: '3',
              objectType: 'Manuscript',
            },
            members: [
              {
                id: '7',
                user: {
                  id: '1',
                  username: 'test',
                },
                status: 'completed',
              },
            ],
          },
        ],
        status: 'submitted',
        meta: {
          title: 'Case report',
          declarations: {
            openData: 'No/Not Applicable',
            openPeerReview: null,
            preregistered: 'no',
            previouslySubmitted: 'no',
            researchNexus: null,
            streamlinedReview: 'no',
          },
          articleSections: null,
          articleType: 'opinion',
          history: null,
        },
      },
    ],
  },
}

const getProjects = item => item.map(c => c.props().version)

describe('Dashboard', () => {
  const makeWrapper = async (opts = {}) => {
    const mocks = [
      {
        request: {
          query: queries.dashboard,
        },
        result: {
          data: JSON.parse(JSON.stringify(mockData)),
        },
      },
    ]

    mocks[0].result.data.journals.manuscripts = opts.empty
      ? []
      : mocks[0].result.data.journals.manuscripts

    const wrapper = mount(
      <MemoryRouter>
        <JournalProvider journal={journal}>
          <ThemeProvider theme={{ colorPrimary: 'blue' }}>
            <MockedProvider addTypename={false} mocks={mocks}>
              <Dashboard conversion={{ converting: false }} />
            </MockedProvider>
          </ThemeProvider>
        </JournalProvider>
      </MemoryRouter>,
    )
    await waitABit()
    wrapper.update()
    return wrapper
  }

  it('shows a message when there are no projects', async () => {
    const dashboard = await makeWrapper({ empty: true })
    expect(dashboard.find(UploadContainer)).toHaveLength(2)
    expect(dashboard.find(OwnerItem)).toHaveLength(0)
    expect(dashboard.find(ReviewerItem)).toHaveLength(0)
  })

  it('shows a list of manuscripts submitted by the current user', async () => {
    const dashboard = await makeWrapper({ empty: false })
    expect(dashboard.find('.empty')).toHaveLength(0)
    const section = dashboard.find(OwnerItem)
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([mockData.journals.manuscripts[0]])
  })

  it('shows a list of manuscripts to be reviewed', async () => {
    const dashboard = await makeWrapper({ empty: false })

    expect(dashboard.find(UploadContainer)).toHaveLength(1)
    const section = dashboard.find(ReviewerItem)
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([mockData.journals.manuscripts[0]])
  })

  it('shows a list of projects where the current user is the editor', async () => {
    const dashboard = await makeWrapper({ empty: false })

    expect(dashboard.find(UploadContainer)).toHaveLength(1)
    const section = dashboard.find(EditorItem)
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([mockData.journals.manuscripts[0]])
  })
})
