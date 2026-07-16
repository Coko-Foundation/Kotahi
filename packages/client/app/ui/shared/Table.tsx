import styled from 'styled-components'
import { Table as OriginalTable, th, grid } from '@coko/client'

const Table = styled(OriginalTable)`
  /* stylelint-disable declaration-no-important */

  .ant-table-wrapper {
    border: 1px solid ${th('colorPrimary')};
    border-radius: ${th('borderRadius')};
    overflow: hidden;
  }

  .ant-pagination {
    justify-content: flex-end;
  }

  .ant-table-selection-column {
    padding-inline-start: ${grid(4)} !important;
  }

  .ant-table-thead th::before {
    height: 3em !important;
  }

  tbody tr:last-of-type {
    > td:first-of-type {
      border-bottom-left-radius: ${th('borderRadius')};
    }

    > td:last-of-type {
      border-bottom-right-radius: ${th('borderRadius')};
    }
  }
`

export default Table
