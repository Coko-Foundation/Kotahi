import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { grid } from '@pubsweet/ui-toolkit'
import {
  ActionButton,
  RoundIconButton,
  SectionContent,
  SectionRow,
} from '../../../shared'
import { articleStatuses } from '../../../../globals'
import Confirm from './Confirm'
import Modal from '../../../component-modal/src/Modal'
import InviteCollaborators from './InviteCollaborators'
import { isAuthor } from '../../../../shared/userPermissions'

const StyledSectionRow = styled(SectionRow)`
  display: flex;
  gap: ${grid(2)};
  justify-content: right;
`

const ConfirmWrapper = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 10000;
`

const StyledModal = styled(Modal)`
  width: 680px;
`

const LabAction = ({ currentUser, form, manuscript, onSubmit }) => {
  const [submitStatus, setSubmitStatus] = useState('')
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [showCollaborateModal, setShowCollaborateModal] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async () => {
    setSubmitStatus('pending')
    onSubmit()
      .then(() => setSubmitStatus('success'))
      .catch(() => setSubmitStatus('failure'))
  }

  const handleSubmitForPublishing = () => {
    if (form.haspopup) {
      setConfirmingSubmit(true)
    } else {
      handleSubmit()
    }
  }

  return (
    <>
      <SectionContent>
        <StyledSectionRow>
          <RoundIconButton
            iconName="Users"
            onClick={() => setShowCollaborateModal(true)}
            primary
          />
          {manuscript.status !== articleStatuses.published &&
            manuscript.status !== articleStatuses.submitted &&
            isAuthor(manuscript, currentUser) && (
              <ActionButton
                onClick={handleSubmitForPublishing}
                primary
                status={submitStatus}
              >
                {t('manuscriptSubmit.submitForPublishing')}
              </ActionButton>
            )}
        </StyledSectionRow>
      </SectionContent>
      {confirmingSubmit && (
        <ConfirmWrapper>
          <Confirm
            errors={{}}
            form={form}
            submit={handleSubmit}
            toggleConfirming={() => setConfirmingSubmit(!confirmingSubmit)}
          />
        </ConfirmWrapper>
      )}
      <StyledModal
        isOpen={showCollaborateModal}
        onClose={() => setShowCollaborateModal(false)}
        title={t('manuscriptSubmit.collaborateArticle')}
      >
        <InviteCollaborators
          currentUser={currentUser}
          manuscript={manuscript}
        />
      </StyledModal>
    </>
  )
}

LabAction.propTypes = {
  form: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    children: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sectioncss: PropTypes.string,
        id: PropTypes.string.isRequired,
        component: PropTypes.string.isRequired,
        group: PropTypes.string,
        placeholder: PropTypes.string,
        validate: PropTypes.arrayOf(PropTypes.object.isRequired),
        validateValue: PropTypes.objectOf(
          PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        ),
        hideFromAuthors: PropTypes.string,
        readonly: PropTypes.bool,
      }).isRequired,
    ).isRequired,
    popuptitle: PropTypes.string,
    popupdescription: PropTypes.string,
    haspopup: PropTypes.string.isRequired, // bool as string
  }).isRequired,
  onSubmit: PropTypes.func,
}

LabAction.defaultProps = {
  onSubmit: () => {},
}

export default LabAction
