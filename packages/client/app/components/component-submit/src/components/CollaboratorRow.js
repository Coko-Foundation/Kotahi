import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Select } from '../../../shared'

const StyledListItem = styled.div`
  width: 100%;
`

const getInitials = fullname => {
  const deconstructName = fullname.split(' ')
  return `${deconstructName[0][0].toUpperCase()}${
    deconstructName[1][0] && deconstructName[1][0].toUpperCase()
  }`
}

const UserRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`

const UserDetails = styled.div`
  display: flex;
`

const AccessLabel = styled.span`
  padding: 0 12px;
`

const UserAvatar = styled.div`
  align-items: center;
  background-color: #ffc038;
  border-radius: 50%;
  color: #000;
  display: flex;
  font-size: 14px;
  font-weight: bold;
  height: 24px;
  justify-content: center;
  margin-right: 8px;
  width: 24px;
`

const StyledSelect = styled(Select)`
  width: fit-content;
`

const CollaboratorRow = ({
  id,
  onChangeAccess,
  onRemoveAccess,
  role,
  status,
  teamId,
  canChangeAccess,
  user,
}) => {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const dropdownItems = [
    { value: 'read', label: t('collaborateForm.canView') },
    { value: 'write', label: t('collaborateForm.canEdit') },
    { value: 'remove', label: t('collaborateForm.removeAccess') },
  ]

  const { username, id: userId } = user
  const isAuthor = role === 'author'

  const customStyles = {
    control: provided => ({
      ...provided,
      border: 'none',
      borderRadius: 0,
      minHeight: 'unset',
      minWidth: '10em',
    }),
  }

  const handleChange = async ({ value }) => {
    setLoading(true)

    if (value === 'remove') {
      await onRemoveAccess({ teamId, userId })
    } else {
      await onChangeAccess({ teamMemberId: id, value })
    }

    setLoading(false)
  }

  return (
    <StyledListItem key={id}>
      <UserRow isAuthor={isAuthor}>
        <UserDetails>
          <UserAvatar>{getInitials(username)}</UserAvatar>
          <span>{username}</span>
        </UserDetails>
        {isAuthor ? (
          <AccessLabel>{t('collaborateForm.author')}</AccessLabel>
        ) : (
          <>
            {canChangeAccess ? (
              <StyledSelect
                bordered={false}
                customStyles={customStyles}
                defaultValue={dropdownItems.find(v => v.value === status)}
                isLoading={loading}
                onChange={handleChange}
                options={dropdownItems}
              />
            ) : (
              <AccessLabel>
                {dropdownItems.find(v => v.value === status).label}
              </AccessLabel>
            )}
          </>
        )}
      </UserRow>
    </StyledListItem>
  )
}

CollaboratorRow.propTypes = {
  id: PropTypes.string.isRequired,
  onChangeAccess: PropTypes.func.isRequired,
  onRemoveAccess: PropTypes.func.isRequired,
  role: PropTypes.string.isRequired,
  status: PropTypes.string,
  teamId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  canChangeAccess: PropTypes.bool.isRequired,
}

CollaboratorRow.defaultProps = {
  status: '',
}

export default CollaboratorRow
