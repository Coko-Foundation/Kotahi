import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Action } from '../../../shared'
import { ConfigContext } from '../../../config/src'

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const statusMapper = {
  new: {
    text: 'Continue submission',
  },
  submitted: {
    text: 'View',
  },
  revise: {
    text: 'Revise',
  },
  revising: {
    text: 'Continue revision',
  },
  accepted: {
    text: 'View',
  },
  rejected: {
    text: 'View',
  },
  published: {
    text: 'View',
  },
}

const AuthorProofingLink = props => {
  const { manuscript, urlFrag, currentUser } = props
  const history = useHistory()
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  // #region action
  const actionText = statusMapper[manuscript.status]?.text

  const handleClickAction = e => {
    e.stopPropagation()
    history.push(`${urlFrag}/versions/${manuscript.id}/submit`)
  }
  // #endregion action

  // #region author-proofing
  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled // let's set this based on the config
  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  const show =
    authorProofingEnabled &&
    manuscript.authorFeedback.assignedAuthors?.length > 0 &&
    sortedAuthors[0]?.user?.id === currentUser.id

  let authorProofingAction = null

  if (show) {
    const handleClickAuthorProofingAction = e => {
      e.stopPropagation()
      history.push(`${urlFrag}/versions/${manuscript.id}/production`)
    }

    let authorProofingLinkText = null

    if (['assigned', 'inProgress'].includes(manuscript.status)) {
      authorProofingLinkText = t(
        'dashboardPage.mySubmissions.Provide production feedback',
      )
    }

    if (manuscript.status === 'completed') {
      authorProofingLinkText = t(
        'dashboardPage.mySubmissions.View production feedback',
      )
    }

    authorProofingAction = (
      <Action
        data-testid="author-proofing-editor"
        onClick={handleClickAuthorProofingAction}
      >
        {authorProofingLinkText}
      </Action>
    )
  }
  // #endregion author-proofing

  return (
    <Container>
      <Action onClick={handleClickAction}>{actionText}</Action>
      {authorProofingAction}
    </Container>
  )
}

AuthorProofingLink.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default AuthorProofingLink
