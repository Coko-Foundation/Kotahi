import React from 'react'
import { Action } from '@pubsweet/ui'
import { Row, Cell, LastCell } from './style'
import { Primary, UserInfo } from '../../shared'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const FlaxPageRow = ({ flaxPage, onManageClick }) => {
  return (
    <Row>
      <Cell>
        <UserInfo>
          <Primary>{flaxPage.title}</Primary>
        </UserInfo>
      </Cell>
      <Cell>{convertTimestampToDateString(flaxPage.created)}</Cell>
      <LastCell>
        <Action onClick={() => onManageClick(flaxPage)}>Manage</Action>
      </LastCell>
    </Row>
  )
}

export default FlaxPageRow
