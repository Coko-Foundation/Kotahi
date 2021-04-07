import React from 'react'
import { gql, useMutation } from '@apollo/client'
// import { Action } from '@pubsweet/ui'
import config from 'config'
import PropTypes from 'prop-types'
import { UserAvatar } from '../../component-avatar/src'
import {
  Row,
  Cell,
  LastCell,
  UserCombo,
  Primary,
  Secondary,
  UserInfo,
  StyledTopic,
  StyledTableLabel,
  // SuccessStatus,
  // ErrorStatus,
  // NormalStatus,
  UserAction as Action,
  StatusBadge,
} from './style'

import { convertTimestampToDate } from '../../../shared/time-formatting'
import { convertCamelCaseToText } from '../../../shared/convertCamelCaseToText'
import { articleStatuses } from '../../../globals'
import { publishManuscriptMutation } from '../../component-review/src/components/queries'

const DELETE_MANUSCRIPT = gql`
  mutation($id: ID!) {
    deleteManuscript(id: $id)
  }
`

const urlFrag = config.journal.metadata.toplevel_urlfragment

// manuscriptId is always the parent manuscript's id
const User = ({ manuscriptId, manuscript, submitter, history, ...props }) => {
  const [publishManuscript] = useMutation(publishManuscriptMutation)

  const [deleteManuscript] = useMutation(DELETE_MANUSCRIPT, {
    update(cache, { data: { deleteManuscriptId } }) {
      const id = cache.identify({
        __typename: 'Manuscript',
        id: deleteManuscriptId,
      })

      cache.evict({ id })
    },
  })

  const publishManuscriptHandler = () => {
    publishManuscript({
      variables: { id: manuscript.id },
      update: (cache, { data }) => {
        cache.modify({
          id: cache.identify(manuscript),
          fields: {
            status: data.publishManuscript.status,
          },
        })
      },
    })
  }

  const filterByTopic = topic => {
    props.setSelectedTopic(topic)
    history.replace(`${urlFrag}/admin/manuscripts?topic=${topic}`)
  }

  return (
    <Row>
      {process.env.INSTANCE_NAME === 'aperture' && (
        <Cell>{manuscript.meta && manuscript.meta.title}</Cell>
      )}
      {['elife'].includes(process.env.INSTANCE_NAME) && (
        <Cell>{manuscript.submission && manuscript.submission.articleId}</Cell>
      )}
      {['ncrc'].includes(process.env.INSTANCE_NAME) && (
        <Cell><span style={{wordBreak: "break-word"}}>{manuscript.submission && manuscript.submission.articleDescription}</span></Cell>
      )}
      <Cell>{convertTimestampToDate(manuscript.created)}</Cell>
      <Cell>{convertTimestampToDate(manuscript.updated)}</Cell>
      {process.env.INSTANCE_NAME === 'ncrc' && (
        <Cell>
          {manuscript.submission?.topics?.map(topic => {
            return (
              <StyledTopic
                key={topic}
                onClick={() => filterByTopic(topic)}
                title={convertCamelCaseToText(topic)}
              >
                {convertCamelCaseToText(topic)}
              </StyledTopic>
            )
          })}
        </Cell>
      )}
      <Cell>
        <StatusBadge status={manuscript.status} />
      </Cell>
      {process.env.INSTANCE_NAME === 'ncrc' && (
        <Cell>
          <StyledTableLabel>
            {manuscript.submission &&
              convertCamelCaseToText(manuscript.submission.labels)}
          </StyledTableLabel>
        </Cell>
      )}
      <Cell>
        {submitter && (
          <UserCombo>
            <UserAvatar user={submitter} />
            <UserInfo>
              <Primary>{submitter.defaultIdentity.name}</Primary>
              <Secondary>
                {submitter.email || `(${submitter.username})`}
              </Secondary>
            </UserInfo>
          </UserCombo>
        )}
      </Cell>
      <LastCell>
        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
          [
            articleStatuses.submitted,
            articleStatuses.evaluated,
            articleStatuses.new,
          ].includes(manuscript.status) && (
            <Action to={`${urlFrag}/versions/${manuscriptId}/evaluation`}>
              Evaluation
            </Action>
          )}
        {process.env.INSTANCE_NAME === 'aperture' && (
          <Action to={`${urlFrag}/versions/${manuscriptId}/decision`}>
            Control
          </Action>
        )}
        <Action to={`${urlFrag}/versions/${manuscriptId}/manuscript`}>
          View
        </Action>
        <Action
          onClick={() => deleteManuscript({ variables: { id: manuscriptId } })}
        >
          Delete
        </Action>
        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) && (
          <Action onClick={publishManuscriptHandler}>Publish</Action>
        )}
      </LastCell>
    </Row>
  )
}

User.propTypes = {
  manuscriptId: PropTypes.string.isRequired,
  manuscript: PropTypes.shape({
    meta: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
    created: PropTypes.string.isRequired,
    id: PropTypes.string,
    updated: PropTypes.string,
    status: PropTypes.string.isRequired,
    // Disabled because submission can have different fields
    // eslint-disable-next-line
    submission: PropTypes.object,
  }).isRequired,
  submitter: PropTypes.shape({
    defaultIdentity: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    email: PropTypes.string,
    username: PropTypes.string.isRequired,
  }).isRequired,
  // eslint-disable-next-line
  history: PropTypes.object,
  setSelectedTopic: PropTypes.func.isRequired,
}

export default User
