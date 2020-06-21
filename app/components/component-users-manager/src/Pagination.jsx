import React from 'react'
import { Action } from '@pubsweet/ui'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
// TODO: Standardize shared components
import Icon from '../../shared/Icon'

const Page = styled.div`
  // height: ${grid(3)};
  // padding: ${grid(1)};
  line-height: ${grid(5)};

  ${props =>
    props.active &&
    css`
      color: ${th('colorPrimary')};
    `}
`

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${grid(2)} ${grid(3)};
`

const PaginationInfo = styled.div``

const Paginators = styled.div`
  display: inline-flex;
`

const PreviousButton = styled.div`
  border: 1px solid ${th('colorFurniture')};

  svg {
    stroke: ${th('colorFurniture')};
  }

  button {
    padding: ${grid(1)};
    line-height: ${grid(5)};
    width: ${grid(5)};
    cursor: pointer;
    svg {
      stroke: ${th('colorText')};
    }
  }
`

const NextButton = styled(PreviousButton)`
  margin-left: -1px;

  button {
    &:before {
      margin-left: -1px;
    }
  }
`

const Paginator = styled.div`
  margin-left: -1px;
  border: 1px solid ${th('colorFurniture')};
  color: ${th('colorFurniture')};
  text-align: center;
  width: ${grid(5)};
  svg {
    stroke: ${th('colorFurniture')};
  }

  button {
    width: ${grid(5)};
    line-height: ${grid(5)};
    cursor: pointer;
    color: ${th('colorText')};
    &:before {
      margin-left: -1px;
    }
  }
`

const PaginationContainer = ({ setPage, limit, page, totalCount }) => {
  const Previous = () => (
    <PreviousButton>
      <Action disabled={page <= 1} onClick={() => setPage(page - 1)}>
        <Icon noPadding>chevron_left</Icon>
      </Action>
    </PreviousButton>
  )

  const Next = () => {
    const lastPage = page >= pages.length
    return (
      <NextButton>
        <Action disabled={lastPage} onClick={() => setPage(page + 1)}>
          <Icon noPadding>chevron_right</Icon>
        </Action>
      </NextButton>
    )
  }

  const PageNumber = ({ pageNumber }) => {
    const active = page === pageNumber
    return (
      <Paginator>
        <Page active={active}>
          {active && <>{pageNumber}</>}
          {!active && (
            <Action onClick={() => setPage(pageNumber)}>{pageNumber}</Action>
          )}
        </Page>
      </Paginator>
    )
  }

  // e.g. Get [1,2,3] from totalCount 9, limit 3
  const pages = [...new Array(Math.ceil(totalCount / limit)).keys()].map(
    p => p + 1,
  )

  const firstResult = (page - 1) * limit + 1
  const lastResult = Math.min((page - 1) * limit + limit, totalCount)

  return (
    <Pagination>
      <PaginationInfo>
        Showing {firstResult} to {lastResult} of {totalCount} results
      </PaginationInfo>
      <Paginators>
        <Previous />
        {pages.map(pageNumber => (
          <PageNumber pageNumber={pageNumber} />
        ))}
        <Next />
      </Paginators>
    </Pagination>
  )
}

export default PaginationContainer
