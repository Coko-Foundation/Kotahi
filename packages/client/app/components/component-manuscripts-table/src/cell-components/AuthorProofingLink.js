import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Action } from '../../../shared'
import { ConfigContext } from '../../../config/src'

const Container = styled.div`
  display: flex;
  flex-direction: column;
`

const AuthorProofingLink = ({ manuscript, urlFrag, currentUser }) => {
  const { t } = useTranslation()
  const config = useContext(ConfigContext)
  const authorProofingEnabled = config.controlPanel?.authorProofingEnabled // let's set this based on the config
  const history = useHistory()
  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  if (
    manuscript.authorFeedback.assignedAuthors?.length > 0 &&
    sortedAuthors[0]?.user?.id === currentUser.id
  ) {
    return authorProofingEnabled ? (
      <Container>
        <Action
          dataTestId="author-proofing-editor"
          onClick={async e => {
            e.stopPropagation()
            history.push(`${urlFrag}/versions/${manuscript.id}/production`)
          }}
        >
          {['assigned', 'inProgress'].includes(manuscript.status) &&
            t('dashboardPage.mySubmissions.Provide production feedback')}
          {manuscript.status === 'completed' &&
            t('dashboardPage.mySubmissions.View production feedback')}
        </Action>
      </Container>
    ) : null
  }

  return <></>
}

AuthorProofingLink.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    parentId: PropTypes.string,
  }).isRequired,
}

export default AuthorProofingLink
