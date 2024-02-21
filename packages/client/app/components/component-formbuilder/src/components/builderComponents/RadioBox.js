import React from 'react'
import styled from 'styled-components'
import { RadioGroup as UnstableRadioGroup } from '@pubsweet/ui'

const RadioGroup = styled(UnstableRadioGroup)`
  position: relative;
`

const RadioboxFieldBuilder = input => <RadioGroup {...input} />
export default RadioboxFieldBuilder
