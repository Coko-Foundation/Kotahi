/* eslint-disable jsx-a11y/no-static-element-interactions, import/no-unresolved, jsx-a11y/click-events-have-key-events */
/* eslint-disable */

import React, { useState } from 'react'
import { useMutation, useQuery, useApolloClient } from '@apollo/client'
// import { Action } from '@pubsweet/ui'
import config from 'config'
import PropTypes from 'prop-types'
import { Checkbox } from '@pubsweet/ui'
import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import './style.css'
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
  StyledAuthor,
  StyledTableLabel,
  InfoIcon,
  // SuccessStatus,
  // ErrorStatus,
  // NormalStatus,
  UserAction as Action,
  StatusBadge,
  StyledDescriptionWrapper,
  StyledButton,
} from './style'

import { convertTimestampToDate } from '../../../shared/time-formatting'
import { convertCamelCaseToText } from '../../../shared/convertCamelCaseToText'
import { articleStatuses } from '../../../globals'
import { publishManuscriptMutation } from '../../component-review/src/components/queries'
import query from '../../component-submit/src/userManuscriptFormQuery'
import { composeValidate } from '../../component-submit/src/components/FormTemplate'
import { DELETE_MANUSCRIPT } from '../../../queries'

export const validateManuscript = (submission, form, client) =>
  form.children
    .map(element => {
      return composeValidate(
        element.validate,
        element.validateValue,
        element.name,
        JSON.parse(element.doiValidation ? element.doiValidation : false),
        client,
        element.component,
      )(submission[element.name.split('.')[1]])
    })
    .filter(Boolean)

const urlFrag = config.journal.metadata.toplevel_urlfragment

const updateUrlParameter = (url, param, value) => {
  var regex = new RegExp('(' + param + '=)[^&]+')
  return url.replace(regex, '$1' + value)
}

// manuscriptId is always the parent manuscript's id
const User = ({
  manuscriptId,
  manuscript,
  submitter,
  history,
  toggleNewManuscriptCheck,
  selectedNewManuscripts,
  setSelectedStatus,
  setSelectedTopic,
  setSelectedLabel,
  setReadyToEvaluateLabel,
  ...props
}) => {
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [isPublishingBlocked, setIsPublishingBlocked] = useState(false)

  const [deleteManuscript] = useMutation(DELETE_MANUSCRIPT, {
    update(cache, { data: { deleteManuscriptId } }) {
      const id = cache.identify({
        __typename: 'Manuscript',
        id: deleteManuscriptId,
      })

      cache.evict({ id })
    },
  })

  const { data } = useQuery(query, {
    variables: { id: manuscriptId },
    partialRefetch: true,
  })

  const client = useApolloClient()

  const form = data?.formForPurpose?.structure

  const publishManuscriptHandler = async () => {
    if (isPublishingBlocked) {
      return
    }

    setIsPublishingBlocked(true)

    const areThereInvalidFields = await Promise.all(
      validateManuscript(manuscript.submission, form, client),
    )

    if (areThereInvalidFields.filter(Boolean).length === 0) {
      await publishManuscript({
        variables: { id: manuscript.id },
      })
      setIsPublishingBlocked(false)
    }
  }

  const filterArticle = (propertyName, propertyValue, updateFn) => {
    const currentURL = window.location.href.split('?')
    if (currentURL.length === 1) {
      currentURL.push('')
    }
    const updatedQueryString = currentURL[1].includes(`${propertyName}=`)
      ? updateUrlParameter(currentURL[1], propertyName, propertyValue)
      : currentURL[1] + `&${propertyName}=` + propertyValue

    updateFn(propertyValue)
    history.replace('/kotahi/admin/manuscripts?' + updatedQueryString)
  }

  const filterByTopic = topic => {
    filterArticle('topic', topic, setSelectedTopic)
  }

  const filterByArticleStatus = status => {
    filterArticle('status', status, setSelectedStatus)
  }

  const filterByArticleLabel = label => {
    filterArticle('label', label, setSelectedLabel)
  }
  let formattedAbstract

  if (manuscript.submission?.abstract) {
    if (Array.isArray(manuscript.submission.abstract)) {
      formattedAbstract = manuscript.submission.abstract
        .join(' ')
        .replace(/<[^>]*>/g, '')
    } else {
      formattedAbstract = manuscript.submission.abstract.replace(/<[^>]*>/g, '')
    }
  }

  return (
    <Row>
      {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
        <Cell>{manuscript.meta && manuscript.meta.title}</Cell>
      )}
      {['elife'].includes(process.env.INSTANCE_NAME) && (
        <Cell>{manuscript.submission && manuscript.submission.articleId}</Cell>
      )}
      {['ncrc'].includes(process.env.INSTANCE_NAME) && (
        <>
          <Cell minWidth="150px">
            <StyledDescriptionWrapper>
              {manuscript.status === articleStatuses.new &&
                !manuscript.submission.labels && (
                  <Checkbox
                    checked={selectedNewManuscripts.includes(manuscript.id)}
                    onChange={() => toggleNewManuscriptCheck(manuscript.id)}
                  />
                )}
              <span style={{ wordBreak: 'break-word' }}>
                {manuscript.submission.articleURL ? (
                  <a href={manuscript.submission.articleURL.includes('https://') ? manuscript.submission.articleURL : 'https://' + manuscript.submission.articleURL} target="_blank">
                    {manuscript.submission &&
                      manuscript.submission.articleDescription}
                  </a>
                ) : (
                  manuscript.submission.articleDescription
                )}
              </span>
              <>
                <Tooltip
                  destroyTooltipOnHide={{ keepParent: false }}
                  getTooltipContainer={el => el}
                  overlay={
                    <span>
                      {formattedAbstract?.length > 1000
                        ? `${formattedAbstract.slice(0, 1000)}...`
                        : formattedAbstract}
                    </span>
                  }
                  overlayInnerStyle={{
                    backgroundColor: 'black',
                    color: 'white',
                    borderColor: 'black',
                  }}
                  overlayStyle={{
                    maxWidth: '65vw',
                    wordBreak: 'break-word',
                    display: `${!formattedAbstract && 'none'}`,
                  }}
                  placement="bottomLeft"
                  trigger={['hover']}
                >
                  <InfoIcon>i</InfoIcon>
                </Tooltip>
              </>
            </StyledDescriptionWrapper>
          </Cell>
          <Cell>{manuscript.submission.journal}</Cell>
        </>
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
        <span onClick={() => filterByArticleStatus(manuscript.status)}>
          <StatusBadge
            clickable
            published={manuscript.published}
            status={manuscript.status}
          />
        </span>
      </Cell>
      {process.env.INSTANCE_NAME === 'ncrc' && (
        <Cell>
          {manuscript.submission && manuscript.submission.labels ? (
            <StyledTableLabel
              onClick={() => filterByArticleLabel(manuscript.submission.labels)}
            >
              {manuscript.submission &&
                convertCamelCaseToText(manuscript.submission.labels)}
            </StyledTableLabel>
          ) : (
            <StyledButton
              onClick={() => setReadyToEvaluateLabel(manuscript.id)}
              primary
            >
              Select
            </StyledButton>
          )}
        </Cell>
      )}
      {process.env.INSTANCE_NAME !== 'ncrc' && (
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
      )}
      {['ncrc'].includes(process.env.INSTANCE_NAME) && (
        <Cell>
          {manuscript.teams.map(team => (
            <StyledAuthor key={team.id}>
              {team.role !== 'author' &&
                team.role !== 'reviewer' &&
                team.members[0].user.defaultIdentity.name}
            </StyledAuthor>
          ))}
        </Cell>
      )}
      <LastCell>
        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
          [
            articleStatuses.submitted,
            articleStatuses.evaluated,
            articleStatuses.new,
            articleStatuses.published,
          ].includes(manuscript.status) && (
            <Action to={`${urlFrag}/versions/${manuscriptId}/evaluation`}>
              Evaluation
            </Action>
          )}
        {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
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
        {['elife', 'ncrc'].includes(process.env.INSTANCE_NAME) &&
          manuscript.status === articleStatuses.evaluated && (
            <Action
              isDisabled={isPublishingBlocked}
              onClick={publishManuscriptHandler}
            >
              Publish
            </Action>
          )}
      </LastCell>
    </Row>
  )
}

User.propTypes = {
  manuscriptId: PropTypes.string.isRequired,
  manuscript: PropTypes.shape({
    teams: PropTypes.arrayOf(PropTypes.object),
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
  }),
  toggleNewManuscriptCheck: PropTypes.func.isRequired,
  selectedNewManuscripts: PropTypes.arrayOf(PropTypes.object).isRequired,
  setSelectedStatus: PropTypes.func.isRequired,
  history: PropTypes.shape({}),
  setSelectedTopic: PropTypes.func.isRequired,
}
User.defaultProps = {
  history: undefined,
  submitter: {},
}

export default User
