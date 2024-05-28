import React, { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { debounce } from 'lodash'
import { Field, Formik } from 'formik'
import { grid, th } from '@pubsweet/ui-toolkit'
import { useQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { ActionButton, SelectAsync, Select } from '../../../shared'
import { GET_MANUSCRIPT_TEAMS, SEARCH_USERS_BY_EMAIL } from '../graphql/queries'
import { isAdmin, isAuthor } from '../../../../shared/userPermissions'
import {
  ADD_TEAM_MEMBERS,
  REMOVE_TEAM_MEMBER,
  UPDATE_TEAM_MEMBER,
} from '../graphql/mutations'
import CollaboratorList from './CollaboratorList'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
`

const RowGridStyled = styled.div`
  display: grid;
  gap: ${grid(2)};
  grid-template-columns: repeat(2, minmax(0, 1fr));
`

const SelectWrapper = styled.div`
  width: 100%;
`

const ScrollWrapper = styled.div`
  border: 1px solid ${th('colorBorder')};
  max-height: 400px;
  overflow: auto;
  padding: ${grid(1)} ${grid(2)};
`

const EmailInput = ({
  canChangeAccess,
  fetchOptions,
  field,
  form: { isSubmitting, setFieldValue },
  noResultsSetter,
}) => {
  const { t } = useTranslation()
  const fetchRef = useRef(0)

  const debounceFetcher = useMemo(() => {
    const loadOptions = (searchTerm, setOptions) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      return fetchOptions(searchTerm.trim()).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return
        }

        if (newOptions.length === 0 && field.value.length === 0) {
          noResultsSetter(true)
        }

        setOptions(newOptions)
      })
    }

    return debounce(loadOptions, 800)
  }, [fetchOptions])

  const handleChange = users => {
    noResultsSetter(users.length === 0)
    setFieldValue('users', users)
  }

  return (
    <SelectAsync
      {...field}
      defaultOptions={[]}
      disabled={!canChangeAccess}
      getOptionLabel={option => option?.username}
      getOptionValue={option => option?.id}
      isMulti
      key={`select-async-${isSubmitting}`}
      loadOptions={debounceFetcher}
      onChange={handleChange}
      placeholder={`${t('inviteCollaborator.selectPlaceholder')}...`}
    />
  )
}

EmailInput.propTypes = {
  fetchOptions: PropTypes.func.isRequired,
  field: PropTypes.shape({}).isRequired,
  form: PropTypes.shape({
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  noResultsSetter: PropTypes.func.isRequired,
}

const AccessRightsInput = ({
  accessOptions,
  field,
  form: { setFieldValue },
}) => {
  return (
    <Select
      {...field}
      onChange={access => setFieldValue('access', access.value)}
      options={accessOptions}
    />
  )
}

AccessRightsInput.propTypes = {
  accessOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  field: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  }).isRequired,
  form: PropTypes.shape({ setFieldValue: PropTypes.func.isRequired })
    .isRequired,
}

const InviteCollaborators = ({ currentUser, manuscript }) => {
  const [noAvailableUsers, setNoAvailableUsers] = useState(true)
  const [manuscriptTeams, setManuscriptTeams] = useState([])
  const [addingUsers, setAddingUsers] = useState(false)
  const { t } = useTranslation()

  const manuscriptTeamsVariables = {
    where: {
      objectId: manuscript.id,
      objectType: 'manuscript',
    },
  }

  const {
    loading: loadingManuscriptTeamsData,
    refetch: refetchManuscriptTeams,
  } = useQuery(GET_MANUSCRIPT_TEAMS, {
    variables: manuscriptTeamsVariables,
    fetchPolicy: 'no-cache',
    onCompleted: ({ teams }) => {
      setManuscriptTeams(teams)
    },
  })

  const [searchForUsers] = useMutation(SEARCH_USERS_BY_EMAIL)

  const [addTeamMembers] = useMutation(ADD_TEAM_MEMBERS)

  const [updateTeamMemberStatus] = useMutation(UPDATE_TEAM_MEMBER)

  const [removeTeamMember] = useMutation(REMOVE_TEAM_MEMBER)

  const accessOptions = [
    {
      value: 'read',
      label: 'Can view',
    },
    {
      value: 'write',
      label: 'Can edit',
    },
  ]

  const fetchUserList = async searchQuery => {
    const existingUserIds = manuscriptTeams.flatMap(team =>
      team.members.map(member => member.user.id),
    )

    const variables = {
      search: searchQuery,
      exclude: existingUserIds,
    }

    return searchForUsers({ variables }).then(({ data }) => {
      const { searchUsersByEmail } = data
      return searchUsersByEmail
    })
  }

  const handleFormikSubmit = async (inviteData, { resetForm }) => {
    if (addingUsers) return false
    setAddingUsers(true)

    if (inviteData.users.length < 1) {
      return false
    }

    const collaboratorTeam = manuscriptTeams.find(
      team => team.role === 'collaborator',
    )

    const members = inviteData.users.map(user => user.id)

    const variables = {
      teamId: collaboratorTeam.id,
      members,
      status: inviteData.access,
    }

    return addTeamMembers({ variables }).then(async addTeamData => {
      resetForm()
      const { data } = await refetchManuscriptTeams()
      setManuscriptTeams(data.teams)
      setNoAvailableUsers(true)
      setAddingUsers(false)
      return addTeamData
    })
  }

  const handleUpdateTeamMemberStatus = updateData => {
    const { teamMemberId, value: status } = updateData
    return updateTeamMemberStatus({
      variables: {
        id: teamMemberId,
        input: JSON.stringify({ status }),
      },
    }).then(async updateTeamData => {
      const { data } = await refetchManuscriptTeams()
      setManuscriptTeams(data.teams)
      return updateTeamData
    })
  }

  const handleRemoveTeamMember = variables => {
    return removeTeamMember({
      variables,
    }).then(async removeTeamData => {
      const { data } = await refetchManuscriptTeams()
      setManuscriptTeams(data.teams)
      return removeTeamData
    })
  }

  const canChangeAccess =
    isAdmin(currentUser) || isAuthor(manuscript, currentUser)

  return (
    <Wrapper>
      {canChangeAccess && (
        <Formik
          displayName="inviteCollaborators"
          initialValues={{ users: [], access: 'read' }}
          onSubmit={handleFormikSubmit}
        >
          {({ handleSubmit, isValid }) => (
            <form onSubmit={handleSubmit}>
              <RowGridStyled>
                <SelectWrapper>
                  <Field
                    canChangeAccess={canChangeAccess}
                    component={EmailInput}
                    fetchOptions={fetchUserList}
                    name="users"
                    noResultsSetter={setNoAvailableUsers}
                  />
                </SelectWrapper>
                <RowGridStyled>
                  <Field
                    accessOptions={accessOptions}
                    component={AccessRightsInput}
                    name="access"
                  />
                  <ActionButton
                    disabled={noAvailableUsers || !isValid}
                    primary
                    status={addingUsers ? 'pending' : ''}
                    type="submit"
                  >
                    {t('inviteCollaborator.addUser')}
                  </ActionButton>
                </RowGridStyled>
              </RowGridStyled>
            </form>
          )}
        </Formik>
      )}

      <ScrollWrapper>
        <CollaboratorList
          canChangeAccess={canChangeAccess}
          loading={loadingManuscriptTeamsData}
          manuscriptTeams={manuscriptTeams}
          onChangeAccess={handleUpdateTeamMemberStatus}
          onRemoveAccess={handleRemoveTeamMember}
        />
      </ScrollWrapper>
    </Wrapper>
  )
}

export default InviteCollaborators
