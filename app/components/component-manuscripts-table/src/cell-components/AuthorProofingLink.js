import React from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { Action, ActionGroup } from '@pubsweet/ui'
import { Edit } from 'react-feather'
import styled from 'styled-components'

const StyledActionGroup = styled(ActionGroup)`
  text-align: left;
`

const StyledAction = styled(Action)`
  align-items: center;
  display: flex;
  font-size: 14px;
`

const AuthorProofingLink = ({
  manuscript,
  urlFrag,
  currentUser,
  updateManuscript,
}) => {
  const history = useHistory()
  const authorTeam = manuscript.teams.find(team => team.role === 'author')

  const sortedAuthors = authorTeam?.members
    .slice()
    .sort(
      (a, b) =>
        Date.parse(new Date(b.created)) - Date.parse(new Date(a.created)),
    )

  if (
    ['assigned', 'inProgress'].includes(manuscript.status) &&
    sortedAuthors[0]?.user?.id === currentUser.id
  ) {
    return (
      <StyledActionGroup>
        <StyledAction
          data-testid="control-panel-decision"
          onClick={async e => {
            e.stopPropagation()
            await updateManuscript({
              variables: {
                id: manuscript.id,
                input: JSON.stringify({
                  status: 'inProgress',
                }),
              },
            })
            history.push(`${urlFrag}/versions/${manuscript.id}/production`)
          }}
        >
          <Edit />
        </StyledAction>
      </StyledActionGroup>
    )
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
