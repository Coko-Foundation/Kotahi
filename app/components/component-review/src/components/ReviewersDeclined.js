import React, { useState } from 'react'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { useTranslation } from 'react-i18next'
import { SectionHeader, SectionRow } from '../../../shared'
import { UserAction } from '../../../component-manuscripts-table/src/style'
import DeclinedReviewer from './DeclinedReviewer'

const DropdownTitleContainer = styled.div`
  align-content: center;
  cursor: pointer;
  display: flex;
  font-size: 18px;
  justify-content: space-between;
`

const DeclinedReviewerContainer = styled.div`
  background-color: #f8f8f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 1em;
  margin-left: 1em;
  margin-right: 1em;
  margin-top: 1em;
`

const AddBorder = styled.div`
  :not(:last-child) {
    border-bottom: 0.8px solid #bfbfbf;
  }
`

const ReviewersDeclined = ({ emailAndWebReviewers }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const declinations = emailAndWebReviewers.filter(user => {
    return user.status === 'rejected' // internal name for "Declined"
  })

  return (
    <>
      <SectionHeader onClick={() => setOpen(!open)}>
        <DropdownTitleContainer>
          <UserAction>
            {open
              ? t('decisionPage.Hide Declined')
              : t('decisionPage.See Declined', { count: declinations.length })}
          </UserAction>
          <Icon color="#9e9e9e">{open ? 'chevron-up' : 'chevron-down'}</Icon>
        </DropdownTitleContainer>
      </SectionHeader>

      {open &&
        (declinations && declinations.length > 0 ? (
          <DeclinedReviewerContainer>
            {declinations.map(declined => {
              return (
                <AddBorder key={declined.id}>
                  <DeclinedReviewer declined={declined} />
                </AddBorder>
              )
            })}
          </DeclinedReviewerContainer>
        ) : (
          <SectionRow>{t('decisionPage.No Declined Reviewers')}</SectionRow>
        ))}
    </>
  )
}

export default ReviewersDeclined
