import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { Select } from './Select'
import PlainOrRichText from './PlainOrRichText'

const Container = styled.div`
  margin-top: ${props => grid(props.top)};
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

const StyledSelect = styled(Select)`
  & > div {
    background: white;
  }

  border: 1px solid ${({ theme }) => theme.color.gray95};
  box-shadow: ${props => props.theme.boxShadow.shades[100]};
  width: 94%;
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
export const VersionSwitcher = ({ versions = [], children, top = 2 }) => {
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

  return (
    <>
      <StyledSelect
        onChange={option => selectVersionKey(option.value)}
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
      <Container top={top}>
        {mode === 'props' ? selectedVersion.content : selectedVersion}
      </Container>
    </>
  )
}
