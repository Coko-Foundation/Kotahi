import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import i18next from 'i18next'
import { Select } from '../../shared'
import { languagesLabels } from '../../../i18n/index'

const Container = styled.div`
  max-width: 300px;
  position: relative;
`

const ChangeLanguage = ({ user, updateLanguage }) => {
  const [lang, setLang] = useState({ value: 'en', label: 'English' })

  const update = async (id, e) => {
    await updateLanguage({ variables: { id, preferredLanguage: e.value } })
    setLang(languagesLabels.find(elem => elem.value === e.value))
    i18next.changeLanguage(e.value)
  }

  useEffect(() => {
    const curLang = i18next.language
    const foundLang = languagesLabels.find(elem => elem.value === curLang)

    if (foundLang) {
      setLang(foundLang)
    }
  }, [])

  return (
    <Container>
      <Select
        onChange={e => update(user.id, e)}
        options={languagesLabels}
        placeholder="Choose language"
        value={lang.value}
      />
    </Container>
  )
}

ChangeLanguage.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string.isRequired }).isRequired,
}
export default ChangeLanguage
