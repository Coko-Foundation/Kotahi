import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import Menu from '../src/atoms/Menu'

const props = {
  options: [{ label: 'Foo', value: 'foo' }, { label: 'Bar', value: 'bar' }],
  value: 'foo',
}

const wrapper = shallow(<Menu {...props} />)

describe('Menu', () => {
  test('Snapshot', () => {
    const tree = renderer.create(<Menu {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Renders a Menu', () => {
    expect(wrapper.is('div')).toBeTruthy()
    expect(wrapper).toHaveLength(1)
  })
})
