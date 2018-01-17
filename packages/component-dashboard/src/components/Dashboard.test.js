import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

import Dashboard from './Dashboard'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({ 'pubsweet-client': {} }))

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

  it('shows a list of projects to be reviewed', () => {
    const dashboard = makeWrapper({
      dashboard: {
        owner: [{ id: 1 }],
      },
    })
    expect(dashboard.find('.empty')).toHaveLength(0)
    expect(dashboard.find('.heading')).toHaveLength(1)
  })
})
