import React from 'react'
import styled from 'styled-components'
import User from './User'
import {
  Container,
  Table,
  Header,
  Heading,
  Content,
  Pagination,
  PaginationContainer,
  SortUp,
  SortDown,
  TightRow,
} from '../../shared'

const StyledTable = styled(Table)`
  border-radius: 0;
  border-width: 0;
`

const HeaderCell = styled.th`
  cursor: pointer;
`

const UsersTable = ({
  changeSort,
  currentUser,
  deleteUser,
  limit,
  page,
  setGlobalRole,
  setGroupRole,
  setPage,
  sortDirection,
  sortName,
  totalCount,
  users,
}) => {
  const SortHeader = ({ thisSortName, children }) => {
    const UpDown = () => {
      if (thisSortName !== sortName) return null
      return sortDirection === 'ASC' ? <SortDown /> : <SortUp />
    }

    return thisSortName ? (
      <HeaderCell onClick={() => changeSort(thisSortName)}>
        <TightRow>
          {children} {UpDown()}
        </TightRow>
      </HeaderCell>
    ) : (
      <th>
        <TightRow>{children}</TightRow>
      </th>
    )
  }

  return (
    <Container>
      <Heading>Users</Heading>
      <Content>
        <StyledTable>
          <Header>
            <tr>
              <SortHeader thisSortName="username">Name</SortHeader>
              <SortHeader thisSortName="created">Created</SortHeader>
              <SortHeader thisSortName="lastOnline">Last Online</SortHeader>
              <SortHeader>Roles</SortHeader>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th />
            </tr>
          </Header>
          <tbody>
            {users.map(user => (
              <User
                currentUser={currentUser}
                deleteUser={deleteUser}
                key={user.id}
                setGlobalRole={setGlobalRole}
                setGroupRole={setGroupRole}
                user={user}
              />
            ))}
          </tbody>
        </StyledTable>

        <Pagination
          limit={limit}
          page={page}
          PaginationContainer={PaginationContainer}
          setPage={setPage}
          totalCount={totalCount}
        />
      </Content>
    </Container>
  )
}

export default UsersTable
