import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import Radio from '../src/atoms/Radio'

const props = {
  checked: false,
  label: 'TestLabel',
  name: 'TestName',
  required: true,
  value: 'TestValue',
}

const wrapper = shallow(<Radio {...props} />)

describe('Radio', () => {
  test('Snapshot', () => {
    const tree = renderer.create(<Radio {...props} />).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Input gets the correct props', () => {
    const input = wrapper.find('input')

    expect(input.prop('name')).toBe(props.name)
    expect(input.prop('value')).toBe(props.value)
    expect(input.prop('checked')).toBe(props.checked)
    expect(input.prop('required')).toBe(props.required)
  })
})
