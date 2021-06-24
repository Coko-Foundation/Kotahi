import React, { useState } from 'react'
import { Action } from '@pubsweet/ui'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

import { Icon } from './Icon'
import { zIndex } from '../../globals'

const Page = styled.div`
  line-height: ${grid(5)};
  width: ${grid(5)};
  border: 1px solid ${th('colorFurniture')};
  text-align: center;
  margin-left: -1px;
  button {
    cursor: pointer;
    color: ${th('colorText')};
    width: ${grid(5)};
    line-height: ${grid(5)};
    left: -1px;
  }

  ${props =>
    props.active &&
    css`
      z-index: ${zIndex.form};

      button {
        &[disabled],
        &[disabled]:hover {
          opacity: 1;
          color: ${th('colorPrimary')};

          :before {
            visibility: visible;
            opacity: 1;
          }
        }
        // color: ${th('colorPrimary')};

        &:before:[disabled] {
          visibility: visible;
          opacity: 1;
        }
      }
    `}
`

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${grid(2)} ${grid(3)};
`

export const PaginationContainerShadowed = styled(PaginationContainer)`
  background-color: ${th('colorBackground')};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const PaginationInfo = styled.div`
  strong {
    font-weight: 500;
  }
`

const Paginators = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const PageDots = styled(Page)``

const PreviousButton = styled.div`
  border: 1px solid ${th('colorFurniture')};

  border-radius: ${th('borderRadius')} 0 0 ${th('borderRadius')};

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
  border-radius: 0 ${th('borderRadius')} ${th('borderRadius')} 0;
`

const Previous = ({ page, setPage, switchPages, first }) => (
  <>
    <PreviousButton>
      <Action disabled={page <= 1} onClick={() => setPage(1)}>
        <Icon noPadding>chevrons_left</Icon>
      </Action>
      <Action disabled={first <= 1} onClick={() => switchPages(-10)}>
        <Icon noPadding>chevron_left</Icon>
      </Action>
    </PreviousButton>
  </>
)

const Next = ({ page, pages, switchPages, setPage, lastPages, firstPages }) => {
  const lastPage = page >= pages.length

  return (
    <>
      <NextButton>
        <Action
          disabled={firstPages.includes(lastPages[0] - 1)}
          onClick={() => switchPages(10)}
        >
          <Icon noPadding>chevron_right</Icon>
        </Action>
        <Action disabled={lastPage} onClick={() => setPage(pages.length)}>
          <Icon noPadding>chevrons_right</Icon>
        </Action>
      </NextButton>
    </>
  )
}

const PageNumber = ({ pageNumber, setPage, page }) => {
  const active = page === pageNumber
  return (
    <Page active={active}>
      <Action disabled={active} onClick={() => setPage(pageNumber)}>
        {pageNumber}
      </Action>
    </Page>
  )
}

export const Pagination = ({
  setPage,
  limit,
  page,
  totalCount,
  // eslint-disable-next-line no-shadow
  PaginationContainer,
}) => {
  // e.g. Get [1,2,3] from totalCount 9, limit 3
  const pages = [...new Array(Math.ceil(totalCount / limit)).keys()].map(
    p => p + 1,
  )

  const firstResult = (page - 1) * limit + 1
  const lastResult = Math.min((page - 1) * limit + limit, totalCount)

  const lastPages = pages.slice(pages.length - 3, pages.length)

  const [first, setFirst] = useState(page - 1)
  const [last, setLast] = useState(page + 9)
  const [firstPages, setFirstPages] = useState(pages.slice(first, last))

  const switchPages = n => {
    setFirst(first + n)
    setLast(last + n)
    setFirstPages(pages.slice(first + n, last + n))
  }

  return (
    <PaginationContainer>
      <PaginationInfo>
        Showing <strong>{firstResult}</strong> to <strong>{lastResult}</strong>{' '}
        of <strong>{totalCount}</strong> results
      </PaginationInfo>
      <Paginators>
        <Previous {...{ page, setPage, switchPages, first }} />
        {pages.length > 20 ? (
          <>
            {firstPages.map(pageNumber => (
              <PageNumber
                {...{ pageNumber, setPage, page }}
                key={pageNumber}
                pageNumber={pageNumber}
              />
            ))}

            {!firstPages.includes(lastPages[0]) ? (
              <>
                <PageDots>...</PageDots>
                {lastPages.map(pageNumber => (
                  <PageNumber
                    {...{ pageNumber, setPage, page }}
                    key={pageNumber}
                    pageNumber={pageNumber}
                  />
                ))}
              </>
            ) : null}
          </>
        ) : (
          pages.map(pageNumber => (
            <PageNumber
              {...{ pageNumber, setPage, page }}
              key={pageNumber}
              pageNumber={pageNumber}
            />
          ))
        )}
        <Next
          {...{ pages, page, switchPages, setPage, lastPages, firstPages }}
        />
      </Paginators>
    </PaginationContainer>
  )
}
