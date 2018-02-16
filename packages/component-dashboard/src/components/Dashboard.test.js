import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import Dashboard from './Dashboard'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({ 'pubsweet-client': {} }))

const getProjects = section =>
  section
    .children()
    .not('.heading')
    .map(c => c.props().project)

describe('Dashboard', () => {
  const makeWrapper = (props = {}) => {
    props = Object.assign(
      {
        dashboard: {},
        conversion: {},
      },
      props,
    )

    props.dashboard = Object.assign(
      {
        owner: [],
        reviewer: [],
        editor: [],
      },
      props.dashboard,
    )

    return shallow(<Dashboard {...props} />)
  }

  it('shows a message when there are no projects', () => {
    const dashboard = makeWrapper()
    expect(dashboard.find('.empty')).toHaveLength(1)
    expect(dashboard.find('.heading')).toHaveLength(0)
  })

  it('shows a list of projects submitted by the current user', () => {
    const project = { id: 1 }
    const dashboard = makeWrapper({
      dashboard: { owner: [project] },
    })

    expect(dashboard.find('.empty')).toHaveLength(0)
    const section = dashboard.find('.section')
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([project])
  })

  it('shows a list of projects to be reviewed', () => {
    const project = { id: 1 }
    const dashboard = makeWrapper({
      dashboard: { reviewer: [project] },
    })

    expect(dashboard.find('.empty')).toHaveLength(0)
    const section = dashboard.find('.section')
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([project])
  })

  it('shows a list of projects of which the current user is the editor', () => {
    const project = { id: 1 }
    const dashboard = makeWrapper({
      dashboard: { editor: [project] },
    })

    expect(dashboard.find('.empty')).toHaveLength(0)
    const section = dashboard.find('.section')
    expect(section).toHaveLength(1)
    expect(getProjects(section)).toEqual([project])
  })
})
