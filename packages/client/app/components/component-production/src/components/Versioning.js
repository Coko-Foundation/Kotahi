import React, { useState } from 'react'
import styled from 'styled-components'
import i18next from 'i18next'
import diff from 'node-htmldiff'
import FullWaxEditor from '../../../wax-collab/src/FullWaxEditor'
import {
  ActionButton,
  Section,
  SectionContent,
  Checkbox,
} from '../../../shared'
import { getLanguages } from '../../../../i18n'
import { convertTimestampToDateString } from '../../../../shared/dateUtils'
// import { ConfigContext } from '../../../config/src'

/*

ideas: 

1) Add actual diffing elements to Wax
	multiple user colors?
2) action button with a tick?
	decision page, needs callback
3) Load only one version at a time
	1) on load, get list of versions and top 5 versions
	2) on switch, load versions
4) Save new version doesn't trigger reload

THINK ABOUT:

1) Should we pull in the versions in a more sensible way? Right now we're pulling them all in at once. What if we have 100 versions?
2) Multiple user colors

*/

const TopSection = styled(Section)`
  border-bottom: 1px solid rgba(0 0 0 / 50%);

  & h3 {
    display: flex;
    justify-content: flex-end;

    & > button {
      margin-left: 1em;
    }
  }
`

const TabContainer = styled.div`
  --left-width: 300px;
  box-shadow: 0 2px 6px 0 rgba(0 0 0 / 10%);
  display: flex;
  min-height: calc(100% - 58px);
`

const LeftBlock = styled.div`
  min-width: var(--left-width);

  & h3 {
    margin-bottom: 0.5em;
  }
`

const RightBlock = styled.div`
  border-left: 1px solid rgba(0 0 0 / 50%);
  width: 100%;

  & > section {
    width: 100%;

    & > h5 {
      display: flex;
      padding-bottom: 4px;

      & > button {
        margin-left: 1em;
      }
    }
  }

  & span.deletion {
    // color: black;
    // text-decoration: none;
    // background-color: rgba(0, 255, 0, 0.25);
  }

  & span.insertion {
    // color: black;
    // text-decoration: none;
    // background-color: rgba(255, 0, 0, 0.25);
  }

  & .info {
    display: none;
  }

  & .panelWrapper {
    padding-left: 0;
  }
`

const VersionList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;

  & li {
    display: flex;

    & a:not(.active) {
      color: black;
    }

    & > em {
      margin-left: auto;
    }
  }
`

const formatPublishedDate = date => {
  const curLang = getLanguages().find(elem => elem.value === i18next.language)

  return !!curLang && !!curLang.funcs?.formatDate
    ? curLang.funcs?.formatDate(date, true, false)
    : convertTimestampToDateString(date)
}

const atomicTags = [
  'iframe',
  'object',
  'math',
  'svg',
  'script',
  'video',
  'head',
  'style' /* previous are defaults */,
  'math-display',
  'math-inline',
  'em',
]

const makeDiffedSource = (html1, html2) => {
  const diffedVersion = diff(html1, html2, '', '', atomicTags.join(','))
    .replaceAll(/<del/g, '<span class="deletion"')

    .replaceAll(/<ins/g, '<span class="insertion"')
    .replaceAll(/\/del>/g, '/span>')
    .replaceAll(/\/ins>/g, '/span>')

  // console.log('Diffed version: ', diffedVersion)
  return diffedVersion
}

const Versioning = ({
  manuscript,
  currentUser,
  saveCurrentVersion,
  addNewVersion,
}) => {
  // const { production } = useContext(ConfigContext)
  // const historyIntervalInMinutes = production.manuscriptVersionHistory.historyIntervalInMinutes || 10
  const { username } = currentUser

  const versionList = [
    {
      source: manuscript.meta.source,
      user: { id: currentUser.id, userName: currentUser.username },
      created: Date.now(),
    },
    ...(manuscript.meta.previousVersions || []),
  ]

  const [shownVersion, setShownVersion] = useState(0)
  const [currentSource, setCurrentSource] = useState(manuscript.meta.source)
  const [useDiffing, setUseDiffing] = useState(true)

  // console.log('Current version list: ', versionList)
  // console.log('Current version: ', versionList[shownVersion])

  const workFromOldVersion = async index => {
    // This moves the current version to the version list, the sets the selected version as the working version

    // console.log('Resurrecting version: ', index)

    // First, save the current version to the top of the list of versions

    const resurrectedVersion = versionList[index]

    const archivedCurrentVersion = {
      created: Date.now(),
      source: manuscript.meta.source,
      user: { id: currentUser.id, userName: currentUser.username },
      title: `${currentUser.username}, ${formatPublishedDate(Date.now())}`,
    }

    // what is happening to the versionList here? Is that what's screwing us up?
    await addNewVersion(archivedCurrentVersion)

    // Second, get the old version out of the list

    // console.log('Making this the current version: ', resurrectedVersion)
    saveCurrentVersion(resurrectedVersion.source)

    // Then, set the selected version as the working version of the manuscript

    // TTODO: This needs to trigger a complete redraw!
  }

  return (
    <SectionContent style={{ height: '100%' }}>
      <TopSection>
        <h3>
          {shownVersion + 1 < versionList.length ? (
            <Checkbox
              checked={useDiffing}
              handleChange={() => {
                setUseDiffing(() => !useDiffing)
              }}
              id="showChanges"
              label="Show changes"
              style={{
                alignItems: 'center',
                fontSize: '16px',
                paddingTop: '3px',
              }}
              value="Show changes"
            />
          ) : null}
          <ActionButton
            onClick={e => {
              e.preventDefault()
              // console.log('Saving a new version')

              const newVersion = {
                created: Date.now(),
                source: manuscript.meta.source,
                user: { id: currentUser.id, userName: currentUser.username },
              }

              addNewVersion(newVersion)

              saveCurrentVersion(newVersion.source)
              // TODO: this needs to trigger a redraw of the components
            }}
            primary
            // type="submit"
          >
            Save current version
          </ActionButton>
        </h3>
      </TopSection>
      <TabContainer>
        <LeftBlock>
          <Section>
            <h3 style={{ display: 'flex' }}>
              <strong style={{ marginRight: 'auto' }}>Version history</strong>
            </h3>
            <VersionList>
              {versionList.length ? (
                versionList.map((version, index) => (
                  <li key={`version-${version.created}`}>
                    <a
                      className={shownVersion === index ? 'active' : ''}
                      href="/#"
                      onClick={e => {
                        e.preventDefault()
                        setShownVersion(index)
                        setCurrentSource(
                          index === 0
                            ? manuscript.meta.source
                            : versionList[index].source,
                        )
                      }}
                    >
                      {versionList.length - index}.{' '}
                      <strong>{version.user.userName}</strong>
                      {', '}
                      <span>{formatPublishedDate(version.created)}</span>
                    </a>
                  </li>
                ))
              ) : (
                <dl>
                  <dt>No previous saved versions</dt>
                </dl>
              )}
            </VersionList>
          </Section>
        </LeftBlock>
        <RightBlock>
          <Section>
            <h5>
              Edited by{' '}
              <strong style={{ marginLeft: '0.25em' }}>{username}</strong>
              <span style={{ marginRight: 'auto' }}>
                {`, ${formatPublishedDate(versionList[shownVersion].created)}`}
              </span>
              {shownVersion !== 0 ? (
                <ActionButton
                  onClick={e => {
                    e.preventDefault()
                    workFromOldVersion(shownVersion)
                  }}
                >
                  Restore this version
                </ActionButton>
              ) : null}
            </h5>
            <FullWaxEditor
              key={`${useDiffing}-${versionList[shownVersion].created}`}
              readonly
              user={currentUser}
              value={
                // We are showing a diffed version for all except the oldest version
                shownVersion < versionList.length - 1 && useDiffing
                  ? makeDiffedSource(
                      versionList[shownVersion + 1].source,
                      currentSource,
                    )
                  : currentSource
              }
            />
          </Section>
        </RightBlock>
      </TabContainer>
    </SectionContent>
  )
}

export default Versioning
