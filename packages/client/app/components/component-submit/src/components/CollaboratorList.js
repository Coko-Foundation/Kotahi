import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import CollaboratorRow from './CollaboratorRow'
import { Spinner } from '../../../shared'

const ListWrapper = styled.div``

const RowWrapper = styled.div`
  padding: ${grid(0.5)} 0;
`

const CollaboratorList = ({
  canChangeAccess,
  className,
  onChangeAccess,
  onRemoveAccess,
  loading,
  manuscriptTeams,
}) => {
  if (loading) return <Spinner />

  return manuscriptTeams.map(
    team =>
      team.members.length > 0 && (
        <ListWrapper key={team.id}>
          {team.members.map(member => (
            <RowWrapper key={member.id}>
              <CollaboratorRow
                canChangeAccess={canChangeAccess}
                onChangeAccess={onChangeAccess}
                onRemoveAccess={onRemoveAccess}
                role={team.role}
                teamId={team.id}
                {...member}
              />
            </RowWrapper>
          ))}
        </ListWrapper>
      ),
  )
}

CollaboratorList.propTypes = {
  canChangeAccess: PropTypes.bool.isRequired,
  onChangeAccess: PropTypes.func.isRequired,
  onRemoveAccess: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  manuscriptTeams: PropTypes.arrayOf(
    PropTypes.shape({
      members: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          status: PropTypes.string,
          user: PropTypes.shape({
            username: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
          }),
        }),
      ),
      id: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

export default CollaboratorList
