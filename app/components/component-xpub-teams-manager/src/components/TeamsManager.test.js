import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import TeamsManager from './TeamsManager'

import Team from './Team'
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

describe('TeamsManager', () => {
  const makeWrapper = (props = {}) => {
    props = Object.assign(
      {
        teams: [],
        userOptions: [
          { id: '1', username: 'author' },
          { id: '2', username: 'managing Editor' },
        ],
      },
      props,
    )

    return shallow(<TeamsManager {...props} />)
  }

  it('shows nothing when there are no teams', () => {
    const teammanager = makeWrapper()
    expect(teammanager.find(Team)).toHaveLength(0)
    expect(teammanager.find(TeamCreator)).toHaveLength(1)
  })

  it('shows a list of teams created', () => {
    const teammanager = makeWrapper({
      teams: [
        {
          id: 1,
          name: 'team1',
          teamType: {
            name: 'Senior Editors',
            permissions: '',
          },
          object: {
            type: 'collection',
            id: '1',
          },
          members: [],
        },
        {
          id: 1,
          name: 'team2',
          teamType: {
            name: 'Handling Editors',
            permissions: '',
          },
          object: {
            type: 'collection',
            id: '1',
          },
          members: [],
        },
      ],
    })

    expect(teammanager.find(Team)).toHaveLength(2)
  })
})
