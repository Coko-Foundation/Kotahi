import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { sanitize } from 'isomorphic-dompurify'
import { Button, PlainButton } from '@pubsweet/ui'
import { unescape } from 'lodash'
import { th } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { Heading1 } from '../style'

const Wrapper = styled.div`
  background: ${th('colorBackground')};
  color: ${th('colorText')};
  line-height: ${th('lineHeightBase')};
  max-height: 100%;
  max-width: 60em;
  overflow-y: auto;
  padding: calc(${th('gridUnit')} * 6);
`

const Paragraph = styled.p`
  font-size: ${th('fontSizeBase')};
  margin-bottom: calc(${th('gridUnit')} * 3);
  width: 100%;
`

const Divider = styled.span`
  margin: 0 ${th('gridUnit')};
`

const createMarkup = encodedHtml => ({
  __html: sanitize(unescape(encodedHtml)),
})

const Confirm = ({ toggleConfirming, form, submit, errors }) => {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <article>
        {Object.keys(errors).length > 0 ? (
          <>
            <Heading1>
              {t('manuscriptSubmit.Errors in your submission')}
            </Heading1>
            <Paragraph>
              {t('manuscriptSubmit.errorsList')} {JSON.stringify(errors)}
            </Paragraph>
          </>
        ) : (
          <>
            <Heading1 dangerouslySetInnerHTML={createMarkup(form.popuptitle)} />
            <Paragraph
              dangerouslySetInnerHTML={createMarkup(form.popupdescription)}
            />
            <Button onClick={submit} primary type="submit">
              {t('manuscriptSubmit.Submit')}
            </Button>
            <Divider> {t('manuscriptSubmit.or')} </Divider>
          </>
        )}
        <PlainButton onClick={toggleConfirming}>
          {t('manuscriptSubmit.get back to your submission')}
        </PlainButton>
      </article>
    </Wrapper>
  )
}

Confirm.propTypes = {
  toggleConfirming: PropTypes.func.isRequired,
  form: PropTypes.shape({
    popuptitle: PropTypes.string.isRequired,
    popupdescription: PropTypes.string.isRequired,
  }).isRequired,
  submit: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
}

export default Confirm
