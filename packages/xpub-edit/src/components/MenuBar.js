import React from 'react'
import styled from 'styled-components'
import map from 'lodash/map'
import MenuButton from './MenuButton'

const Wrapper = styled.div`
  align-items: baseline;
  display: flex;
  margin-bottom: 0.8em;
  margin-top: 0;
`

const Legend = styled.div`
  font-size: var(--font-size-base);
  margin-right: 10px;
`

const MenuBar = ({ title, menu, state, dispatch }) => (
  <Wrapper>
    {title && <Legend>{title}</Legend>}

    {['marks', 'blocks', 'insert', 'history', 'table'].map(name =>
      map(menu[name], (item, key) => (
        <MenuButton
          handle={e => {
            e.preventDefault()
            item.run(state, dispatch)
          }}
          item={item}
          key={key}
          state={state}
          title={title}
        />
      )),
    )}
  </Wrapper>
)

export default MenuBar
