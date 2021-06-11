import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
import { Select } from './Select'

const Container = styled.div`
  margin-top: ${props => grid(props.top)};
`

const generateLabel = (created, versionNumber, count) => {
  if (versionNumber >= count) return `Current version (${versionNumber})`
  return `${new Date(created).toISOString().slice(0, 10)} (${versionNumber})`
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

  const defaultVersion = normalizedVersions[0] && normalizedVersions[0].key
  const [selectedVersionKey, selectVersionKey] = useState(defaultVersion)

  useEffect(() => {
    normalizedVersions = versions.length ? versions : children
    selectVersionKey(normalizedVersions[0] && normalizedVersions[0].key)
  }, [])

  if (!normalizedVersions) {
    return null
  }

  const selectedVersion = normalizedVersions.find(
    v => v.key === selectedVersionKey,
  )

  return (
    <>
      <Select
        onChange={option => {
          selectVersionKey(option.value)
        }}
        options={normalizedVersions.map((d, i) => ({
          value: d.key,
          label:
            d.label ??
            d.props.label ??
            generateLabel(
              d.props.version.created,
              normalizedVersions.length - i,
              normalizedVersions.length,
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
