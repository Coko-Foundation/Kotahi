import React from 'react'
import Collapse from '../../app/components/shared/Collapse'

export const Base = args => (
  <>
    <Collapse defaultWidth={300}>
      <p>hello</p>
    </Collapse>
  </>
)

export default {
  title: 'Manuscripts/CollapseWrapper',
  component: Collapse,
}
