import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

export const FormGrid = styled.div`
  margin-top: calc(${th('gridUnit')} * 2);
  margin-left: calc(${th('gridUnit')} * 3);
  margin-right: calc(${th('gridUnit')} * 3);
  display: grid;
  grid-template-rows: repeat(
    ${props => props.rows || 4},
    calc(${th('gridUnit')} * 6)
  );
  grid-gap: calc(${th('gridUnit')} * 4);
`

export const FormRow = styled.div`
  align-items: start;
  grid-gap: 16px;
  display: grid;
  border-bottom: 1px solid ${th('colorBorder')};
  margin-bottom: calc(${th('gridUnit')} * -2);
  grid-template-columns: calc(${th('gridUnit')} * 20) calc(
      ${th('gridUnit')} * 60
    );

  label {
    grid-column: 1 / 2;
    line-height: calc(${th('gridUnit')} * 6);
  }

  div {
    grid-column: 2 / 3;
    line-height: calc(${th('gridUnit')} * 6);
    display: flex;
  }

  button {
    margin-left: calc(${th('gridUnit')} * 2);
  }
`

