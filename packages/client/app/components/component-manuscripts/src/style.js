import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'

export const SelectAllField = styled.div`
  align-items: center;
  display: flex;
`
export const SelectedManuscriptsNumber = styled.p`
  font-weight: bold;
  margin-left: 10px;
  margin-right: 15px;
`
export const ControlsContainer = styled.div`
  display: flex;
  flex: 1 1;
  gap: ${grid(2)};
  justify-content: flex-end;
`

export const BulkActionModalContainer = styled.div`
  background-color: white;
  padding: 10px;
`

export const BulkActionModalButtons = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BulkActionModalButton = styled(Button)`
  cursor: pointer;
`
