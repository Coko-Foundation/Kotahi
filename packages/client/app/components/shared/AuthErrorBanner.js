import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'

const ErrorBox = styled.div`
  background-color: ${th('colorFurniture')};
  border-radius: ${th('borderRadius')};
  color: #e33;
  font-size: ${th('fontSizeHeading5')};
  gap: ${grid(2)};
  margin: ${grid(3)};
  padding: ${grid(2)} ${grid(3)};
`

const ErrorLine = styled.div`
  padding: ${grid(1)} 0;
`

const AuthErrorBanner = ({ error }) => {
  const { t } = useTranslation()
  if (error) console.error('Comms error: ', error)
  return (
    <ErrorBox>
      <ErrorLine>{t('error.authError')}</ErrorLine>
      <ErrorLine>{t('error.noEditRights')}</ErrorLine>
      <ErrorLine>{t('error.redirectToDashboard')}...</ErrorLine>
    </ErrorBox>
  )
}

AuthErrorBanner.propTypes = {
  /** An error for logging to the console */
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.any,
}

AuthErrorBanner.defaultProps = { error: null }

export default AuthErrorBanner
