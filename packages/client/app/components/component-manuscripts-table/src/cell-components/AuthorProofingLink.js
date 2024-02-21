import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { Edit } from 'react-feather'
import styled from 'styled-components'
import Tooltip from 'rc-tooltip'
import { useTranslation } from 'react-i18next'
import { color } from '../../../../theme'
import { ConfigContext } from '../../../config/src'

const EditIcon = styled(Edit)`
  color: ${color.brand1.base};
`

const AuthorProofingLink = ({
  manuscript,
  urlFrag,
  currentUser,
  updateManuscript,
}) => {
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
    ['assigned', 'inProgress'].includes(manuscript.status) &&
    sortedAuthors[0]?.user?.id === currentUser.id
  ) {
    return authorProofingEnabled ? (
      <Tooltip
        destroyTooltipOnHide={{ keepParent: true }}
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
        overlay={
          <p>{t('dashboardPage.mySubmissions.Author proofing editor')}</p>
        }
        overlayInnerStyle={{
          backgroundColor: 'black',
          color: 'white',
          borderColor: 'black',
          fontWeight: 'normal',
        }}
        placement="top"
        trigger={['hover']}
      >
        <EditIcon />
      </Tooltip>
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
