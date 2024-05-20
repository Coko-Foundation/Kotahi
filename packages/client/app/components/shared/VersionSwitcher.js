import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { Select } from './Select'
import PlainOrRichText from './PlainOrRichText'
import { articleStatuses } from '../../globals'
import { isAuthor } from '../../shared/userPermissions'
import ActionButton from './ActionButton'
import RoundIconButton from './RoundIconButton'

const Container = styled.div`
  margin-top: ${grid(2)};
`

const VerisonLabelWrapper = styled.div`
  display: flex;
  flex-wrap: no-wrap;
  width: 100%;
`

const Title = styled.p`
  flex-shrink: 1;
  margin: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const VersionIndicator = styled.p`
  flex-basis: fit-content;
  flex-shrink: 0;
  margin: 0 5px;
`

const TopBarWrapper = styled.div`
  display: flex;
  justify-content: ${({ isLabInstance }) =>
    isLabInstance ? 'space-between' : 'left'};
  width: ${props => (props.fullWidth ? 100 : 94)}%;
`

const LabActionsWrapper = styled.div`
  display: flex;
  gap: ${grid(2)};
`

const StyledSelect = styled(Select)`
  & > div {
    background: white;
  }

  border: 1px solid ${({ theme }) => theme.color.gray95};
  box-shadow: ${props => props.theme.boxShadow.shades[100]};
  width: ${({ isLabInstance }) =>
    // eslint-disable-next-line no-nested-ternary
    isLabInstance ? 50 : 100}%;
`

const ConfirmWrapper = styled.div`
  align-items: center;
  background: rgb(255 255 255 / 95%);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10000;
`

const generateLabel = (created, versionNumber, count, manuscriptName, t) => {
  return (
    <VerisonLabelWrapper>
      <Title>
        <PlainOrRichText value={manuscriptName} />
      </Title>
      <VersionIndicator>
        {versionNumber >= count
          ? `— ${t('decisionPage.Current version')} (${versionNumber})`
          : `— ${new Date(created)
              .toISOString()
              .slice(0, 10)} (${versionNumber})`}
      </VersionIndicator>
    </VerisonLabelWrapper>
  )
}

/* eslint-disable import/prefer-default-export */
export const VersionSwitcher = ({
  versions = [],
  children,
  fullWidth = false,
  isLabInstance = false,
  Confirm = null,
  InviteCollaborators = null,
  Modal = null,
  submissionForm = null,
  onSubmit = null,
  currentUser = null,
}) => {
  // One can pass in versions as prop or as children
  let normalizedVersions
  let mode

  if (versions.length) {
    normalizedVersions = versions
    mode = 'props'
  } else if (children) {
    normalizedVersions = children
    mode = 'children'
  }

  const { t } = useTranslation()

  const defaultVersion = normalizedVersions[0] && normalizedVersions[0].key
  const [selectedVersionKey, selectVersionKey] = useState(defaultVersion)
  const [submitStatus, setSubmitStatus] = useState('')
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [showCollaborateModal, setShowCollaborateModal] = useState(false)

  useEffect(() => {
    normalizedVersions = versions.length ? versions : children
    selectVersionKey(normalizedVersions[0]?.key)
  }, [])

  if (!normalizedVersions) {
    return null
  }

  const selectedVersion = normalizedVersions.find(
    v => v.key === selectedVersionKey,
  )

  const handleSubmit = async () => {
    setSubmitStatus('pending')
    onSubmit(selectedVersionKey)
      .then(() => setSubmitStatus('success'))
      .catch(() => setSubmitStatus('failure'))
  }

  const handleSubmitForPublishing = () => {
    if (submissionForm.haspopup) {
      setConfirmingSubmit(true)
    } else {
      handleSubmit()
    }
  }

  const handleChange = option => {
    selectVersionKey(option.value)
  }

  return (
    <>
      <TopBarWrapper fullWidth={fullWidth} isLabInstance={isLabInstance}>
        <StyledSelect
          //   fullWidth={fullWidth}
          isLabInstance={isLabInstance}
          onChange={handleChange}
          options={normalizedVersions.map((d, i) => ({
            value: d.key,
            label:
              d.label ??
              d.props.label ??
              generateLabel(
                d.props.version.created,
                normalizedVersions.length - i,
                normalizedVersions.length,
                d.props.version.submission.$title,
                t,
              ),
          }))}
          placeholder="Select version..."
          standalone
          value={selectedVersionKey}
        />
        {isLabInstance && (
          <LabActionsWrapper>
            {selectedVersion.status !== articleStatuses.published &&
              selectedVersion.status !== articleStatuses.submitted &&
              isAuthor(selectedVersion.manuscript, currentUser) && (
                <ActionButton
                  onClick={handleSubmitForPublishing}
                  primary
                  status={submitStatus}
                >
                  {t('manuscriptSubmit.submitForPublishing')}
                </ActionButton>
              )}
            <RoundIconButton
              iconName="Users"
              onClick={() => setShowCollaborateModal(true)}
              primary
            />
          </LabActionsWrapper>
        )}
      </TopBarWrapper>

      <Container>
        {mode === 'props' ? selectedVersion.content : selectedVersion}
      </Container>

      {isLabInstance && (
        <>
          {confirmingSubmit && (
            <ConfirmWrapper>
              <Confirm
                errors={{}}
                form={submissionForm}
                submit={handleSubmit}
                toggleConfirming={() => setConfirmingSubmit(!confirmingSubmit)}
              />
            </ConfirmWrapper>
          )}
          <Modal
            isOpen={showCollaborateModal}
            onClose={() => setShowCollaborateModal(false)}
            title={t('manuscriptSubmit.collaborateArticle')}
          >
            <InviteCollaborators
              currentUser={currentUser}
              manuscript={selectedVersion.manuscript}
            />
          </Modal>
        </>
      )}
    </>
  )
}
