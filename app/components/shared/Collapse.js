import React, { useState } from 'react'
import styled from 'styled-components'

const CollapseWrapper = styled.div`
  height: 100vh;
  position: fixed;
  display: flex;
  transition: all 300ms;
  border-left: 1px solid #e5e5e5;
  max-height: 100vh;
  left: ${props =>
    props.showCollapse ? `calc(100% - ${props.defaultWidth}px)` : '99%'};
  width: ${props => (props.showCollapse ? `${props.defaultWidth}px` : '0px')};
`

const DragIconWrap = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0px;
`

const DragIcon = styled.div`
  width: max-content;
  padding: 10px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  left: 0px;
  position: relative;
  background: #fff;
  cursor: pointer;
  color: linear-gradient(
    134deg,
    #3aae2a,
    hsl(112.69999999999999, 61.1%, 59.6%)
  );
  z-index: 100000000000;
`

const Collapse = ({
  children,
  defaultWidth = 400,
  showCollapseData = false,
}) => {
  const [showCollapse, setShowCollapse] = useState(showCollapseData)
  return children ? (
    <CollapseWrapper defaultWidth={defaultWidth} showCollapse={showCollapse}>
      <DragIconWrap>
        {showCollapse ? (
          <DragIcon onClick={() => setShowCollapse(!showCollapse)}>
            {'>'}
          </DragIcon>
        ) : (
          <DragIcon onClick={() => setShowCollapse(!showCollapse)}>
            {'<'}
          </DragIcon>
        )}
      </DragIconWrap>
      {children}
    </CollapseWrapper>
  ) : (
    ''
  )
}

export default Collapse
