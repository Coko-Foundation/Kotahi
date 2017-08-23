import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import Radio from '../src/atoms/Radio'

const props = {
  checked: false,
  handleChange: jest.fn(),
  label: 'TestLabel',
  name: 'TestName',
  required: true,
  value: 'TestValue'
}

const wrapper = shallow(<Radio {...props} />)

describe('Radio', () => {
  test('Snapshot', () => {
    const tree = renderer.create(
      <Radio {...props} />
    ).toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly', () => {
    expect(wrapper.is('label')).toBeTruthy()
    expect(wrapper.children()).toHaveLength(2)

    const input = wrapper.childAt(0)
    expect(input.is('input')).toBeTruthy()
    expect(input.children()).toHaveLength(0)

    const labelText = wrapper.childAt(1)
    expect(labelText.text()).toBe(props.label)
    expect(labelText.children()).toHaveLength(0)
  })

  test('Input gets the correct props', () => {
    const input = wrapper.find('input')

    expect(input.prop('name')).toBe(props.name)
    expect(input.prop('value')).toBe(props.value)
    expect(input.prop('checked')).toBe(props.checked)
    expect(input.prop('required')).toBe(props.required)
  })

  test('Change handler should be called on change', () => {
    const input = wrapper.find('input')

    expect(props.handleChange).not.toHaveBeenCalled()

    const event = { target: {} }
    input.simulate('change', event)

    expect(props.handleChange).toHaveBeenCalledTimes(1)
  })
})
