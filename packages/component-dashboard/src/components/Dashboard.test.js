import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'

import Dashboard from './Dashboard'

// this should be elsewhere
Enzyme.configure({ adapter: new Adapter() })

jest.mock('config', () => ({ 'pubsweet-client': {} }))

describe('Dashboard', () => {
  it('can render', () => {
    // doesn't actually work cos of missing props
    const wrapper = shallow(<Dashboard />)
    console.log(wrapper.debug())
  })
})
