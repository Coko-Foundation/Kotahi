/* eslint-disable jsx-a11y/no-static-element-interactions, import/no-unresolved, jsx-a11y/click-events-have-key-events */
/* eslint-disable */

import React, { useState } from 'react'
import { useMutation, useQuery, useApolloClient } from '@apollo/client'
import { get } from 'lodash'
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
import manuscriptsTableConfig from './manuscriptsTableConfig'

export const validateManuscript = (submission, fieldDefinitions, client) =>
  Object.entries(fieldDefinitions)
    .map(([key, element]) =>
      composeValidate(
        element.validate,
        element.validateValue,
        element.name,
        JSON.parse(element.doiValidation ? element.doiValidation : false),
        client,
        element.component,
      )(submission[element.name.split('.')[1]]),
    )
    .filter(Boolean)

const urlFrag = config.journal.metadata.toplevel_urlfragment

const updateUrlParameter = (url, param, value) => {
  var regex = new RegExp('(' + param + '=)[^&]+')
  return url.replace(regex, '$1' + value)
}

/** Find the data stored in the manuscript for this fieldName. If the fieldDefinition from the form has a key/value structure we should
 * treat the manuscript data as the key and obtain the displayValue from the fieldDefinition. Otherwise use the manuscript data directly
 * as the displayValue. If manuscript data is an array, we have to do this for each item in the array.
 * There is special logic for some fieldNames, such as 'created' and 'updated'.
 */
const getValueAndDisplayValue = (fieldName, manuscript, fieldDefinitions) => {
  if (fieldName === 'created')
    return [manuscript.created, convertTimestampToDate(manuscript.created)]
  if (fieldName === 'updated')
    return [manuscript.updated, convertTimestampToDate(manuscript.updated)]

  const valueInManuscript = get(manuscript, fieldName, null)

  const fieldDefinition = fieldDefinitions?.[fieldName]

  if (Array.isArray(valueInManuscript)) {
    return [
      valueInManuscript,
      valueInManuscript.map(
        val =>
          fieldDefinition?.options?.find(o => o.value === val)?.label ?? val,
      ),
    ]
  }

  return [
    valueInManuscript,
    fieldDefinition?.options?.find(o => o.value === valueInManuscript)?.label ??
      valueInManuscript,
  ]
}

const renderManuscriptCell = ({
  manuscript,
  fieldDefinitions,
  selectedNewManuscripts,
  toggleNewManuscriptCheck,
  formattedAbstract,
  convertTimestampToDate,
  convertCamelCaseToText,
  filterByTopic,
  filterByArticleStatus,
  filterByArticleLabel,
  setReadyToEvaluateLabel,
}) => {
  const renderManuscriptColumnsActions = {
    'meta.title': displayValue => {
      return (
        <Cell key="title">
          {process.env.INSTANCE_NAME === 'colab' &&
            manuscript.status === articleStatuses.new &&
            !manuscript.submission.labels && (
              <Checkbox
                checked={selectedNewManuscripts.includes(manuscript.id)}
                onChange={() => toggleNewManuscriptCheck(manuscript.id)}
              />
            )}
          {displayValue}
          {process.env.INSTANCE_NAME === 'colab' && (
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
          )}
        </Cell>
      )
    },
    'submission.articleDescription': displayValue => {
      return (
        <Cell key="desc">
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
                <a href={manuscript.submission.articleURL} target="_blank">
                  {displayValue}
                </a>
              ) : (
                displayValue
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
      )
    },
    'submission.topics': (displayValue, value) => {
      const topicComponents = []

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
          topicComponents.push(
            <StyledTopic
              key={value[i]}
              onClick={() => filterByTopic(value[i])}
              title={displayValue[i]}
            >
              {displayValue[i]}
            </StyledTopic>,
          )
        }
      } else {
        console.error('Topics not coming in as array:', value, displayValue)
        topicComponents.push(<span>Topics could not be loaded.</span>)
      }

      return <Cell key="topics">{topicComponents}</Cell>
    },
    status: (displayValue, value) => {
      return (
        <Cell key="status">
          <span onClick={() => filterByArticleStatus(value)}>
            <StatusBadge
              clickable
              published={manuscript.published}
              status={value}
            />
          </span>
        </Cell>
      )
    },
    'submission.labels': (displayValue, value) => {
      return (
        <Cell key="labels">
          {value ? (
            <StyledTableLabel onClick={() => filterByArticleLabel(value)}>
              {displayValue}
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
      )
    },
    author: () => {
      return (
        <Cell key="author">
          {manuscript.submitter && (
            <UserCombo>
              <UserAvatar user={manuscript.submitter} />
              <UserInfo>
                <Primary>{manuscript.submitter.defaultIdentity.name}</Primary>
                <Secondary>
                  {manuscript.submitter.email ||
                    `(${manuscript.submitter.username})`}
                </Secondary>
              </UserInfo>
            </UserCombo>
          )}
        </Cell>
      )
    },
    editor: () => {
      return (
        <Cell key="editor">
          {manuscript.teams.map(team => (
            <StyledAuthor key={team.id}>
              {team.role !== 'author' &&
                team.role !== 'reviewer' &&
                team.members &&
                team.members[0] &&
                team.members[0].user.defaultIdentity.name}
            </StyledAuthor>
          ))}
        </Cell>
      )
    },
  }

  return fieldName => {
    const [value, displayValue] = getValueAndDisplayValue(
      fieldName,
      manuscript,
      fieldDefinitions,
    )
    const specialRenderer = get(renderManuscriptColumnsActions, fieldName)
    if (specialRenderer) return specialRenderer(displayValue, value)

    return <Cell key={fieldName}>{displayValue}</Cell>
  }
}

// manuscriptId is always the parent manuscript's id
const User = ({
  manuscriptId,
  manuscript,
  fieldDefinitions,
  submitter,
  history,
  toggleNewManuscriptCheck,
  selectedNewManuscripts,
  setSelectedStatus,
  setSelectedTopic,
  setSelectedLabel,
  setReadyToEvaluateLabel,
  selectedStatus,
  selectedLabel,
  selectedTopic,
  filterArticle,
  filterByTopic,
  filterByArticleStatus,
  filterByArticleLabel,
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

  const client = useApolloClient()

  const publishManuscriptHandler = async () => {
    if (isPublishingBlocked) {
      return
    }

    setIsPublishingBlocked(true)

    const areThereInvalidFields = await Promise.all(
      validateManuscript(manuscript.submission, fieldDefinitions, client),
    )

    if (areThereInvalidFields.filter(Boolean).length === 0) {
      await publishManuscript({
        variables: { id: manuscript.id },
      })
      setIsPublishingBlocked(false)
    }
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

  const renderCell = renderManuscriptCell({
    manuscript,
    fieldDefinitions,
    selectedNewManuscripts,
    toggleNewManuscriptCheck,
    formattedAbstract,
    convertTimestampToDate,
    filterByTopic,
    convertCamelCaseToText,
    filterByArticleStatus,
    filterByArticleLabel,
    setReadyToEvaluateLabel,
  })

  return (
    <Row>
      {manuscriptsTableConfig.map(field => {
        return renderCell(field)
      })}
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
  fieldDefinitions: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      component: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }).isRequired,
      ),
    }).isRequired,
  ).isRequired,
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
