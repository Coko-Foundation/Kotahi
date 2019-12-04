import React from 'react'
import Enzyme, { mount } from 'enzyme'
import { MemoryRouter } from 'react-router-dom'
import Adapter from 'enzyme-adapter-react-16'
import faker from 'faker'
import { JournalProvider } from 'xpub-journal'
import { ThemeProvider } from 'styled-components'
import EditorItem from './EditorItem'

import MetadataAuthors from '../metadata/MetadataAuthors'
import MetadataStreamLined from '../metadata/MetadataStreamLined'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate'
import MetadataType from '../metadata/MetadataType'
import MetadataSections from '../metadata/MetadataSections'
import MetadataReviewType from '../metadata/MetadataReviewType'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({
  'pubsweet-client': {},
  authsome: {
    mode: 'authsome',
  },
}))

jest.mock('pubsweet-client/src/helpers/Authorize', () => 'div')

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

describe('EditorItem', () => {
  const makeWrapper = (props = {}) => {
    props = Object.assign(
      {
        version: {
          id: faker.random.uuid(),
          created: '2018-06-07',
          teams: [],
          reviews: [],
          status: props.status,
          meta: {
            history: [
              {
                type: 'submitted',
                date: '2018-06-07',
              },
            ],
          },
        },
        journals: {
          id: faker.random.uuid(),
          title: faker.lorem.sentence(15),
        },
      },
      props,
    )
    return mount(
      <MemoryRouter>
        <ThemeProvider theme={{}}>
          <JournalProvider journal={journal}>
            <EditorItem {...props} />
          </JournalProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )
  }

  it('shows empty metadata', () => {
    const EditorItem = makeWrapper()
    expect(EditorItem.find(MetadataStreamLined).children()).toHaveLength(0)
    expect(EditorItem.find(MetadataAuthors).children()).toHaveLength(0)
    expect(EditorItem.find(MetadataSections).children()).toHaveLength(0)
    expect(
      EditorItem.find(MetadataSubmittedDate)
        .children()
        .text(),
    ).toEqual('2018-06-07')
    expect(
      EditorItem.find(MetadataType)
        .children()
        .text(),
    ).toEqual('None')
    expect(
      EditorItem.find(MetadataReviewType)
        .children()
        .text(),
    ).toEqual('Closed review')
  })

  it('shows all metadata', () => {
    const username = faker.name.findName()
    const EditorItem = makeWrapper({
      version: {
        teams: [
          {
            created: '2018-06-07',
            members: [
              {
                user: {
                  id: faker.random.uuid(),
                  created: '2018-06-07',
                  username,
                  admin: true,
                },
              },
            ],
            teamType: 'author',
          },
        ],
        meta: {
          articleType: 'original-research',
          articleSections: ['cognitive-psychology'],
          declarations: {
            openPeerReview: 'yes',
            streamlinedReview: 'yes',
          },
          history: [
            {
              type: 'submitted',
              date: '2018-06-07',
            },
          ],
        },
      },
    })

    expect(EditorItem.find(MetadataStreamLined).text()).toEqual('Streamlined')
    expect(
      EditorItem.find(MetadataAuthors)
        .children()
        .text(),
    ).toEqual(username)

    expect(
      EditorItem.find(MetadataSections)
        .children()
        .text(),
    ).toEqual(journal.articleSections[0].label)
    expect(
      EditorItem.find(MetadataSubmittedDate)
        .children()
        .text(),
    ).toEqual('2018-06-07')
    expect(
      EditorItem.find(MetadataType)
        .children()
        .text(),
    ).toEqual(journal.articleTypes[0].label)
    expect(
      EditorItem.find(MetadataReviewType)
        .children()
        .text(),
    ).toEqual('Open review')
  })
})
