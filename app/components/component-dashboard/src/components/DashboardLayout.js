import React, { useContext } from 'react'
import { Button } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Link, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import {
  Heading,
  HeadingWithAction,
  HiddenTabsContainer,
  Tab,
  TabContainer,
} from '../../../shared'
import { Container } from '../style'
import SearchControl from '../../../component-manuscripts/src/SearchControl'
import { ControlsContainer } from '../../../component-manuscripts/src/style'
import {
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import { FlexRow } from '../../../../globals'
import { ConfigContext } from '../../../config/src'

const TabLink = styled(Link)`
  color: ${th('colorText')};
  text-decoration: none;
`

const Tabs = styled.div`
  display: flex;
  margin-top: ${grid(1)};
`

const DashboardLayout = ({
  createNewTaskAlerts, // For testing only. Pass in null to disable.
  urlFrag,
  children,
}) => {
  const config = useContext(ConfigContext)
  const history = useHistory()
  const location = useLocation()
  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)
  const dashboardPages = []

  if (config.dashboard?.showSections?.includes('submission'))
    dashboardPages.push({
      href: '/dashboard/submissions',
      label: 'My Submissions',
    })

  if (config.dashboard?.showSections?.includes('review'))
    dashboardPages.push({
      href: '/dashboard/reviews',
      label: 'To Review',
    })

  if (config.dashboard?.showSections?.includes('editor'))
    dashboardPages.push({
      href: '/dashboard/edits',
      label: "Manuscripts I'm Editor of",
    })

  return (
    <Container>
      <HeadingWithAction>
        <FlexRow>
          <Heading>Dashboard</Heading>
          <ControlsContainer>
            <SearchControl
              applySearchQuery={newQuery =>
                applyQueryParams({
                  [URI_SEARCH_PARAM]: newQuery,
                  [URI_PAGENUM_PARAM]: 1,
                })
              }
              currentSearchQuery={currentSearchQuery}
            />
            <Button
              onClick={() => history.push(`${urlFrag}/newSubmission`)}
              primary
            >
              + New submission
            </Button>

            {createNewTaskAlerts && (
              <Button onClick={createNewTaskAlerts}>New Alerts</Button>
            )}
          </ControlsContainer>
        </FlexRow>
      </HeadingWithAction>

      {/* TODO The following block should be replaced with a new LinkTabs component */}
      <HiddenTabsContainer sticky={false}>
        <Tabs>
          {dashboardPages.map(({ href, label }) => (
            <TabContainer key={href}>
              <TabLink to={urlFrag + href}>
                <Tab active={location.pathname.endsWith(href)}>
                  <div>{label}</div>
                </Tab>
              </TabLink>
            </TabContainer>
          ))}
        </Tabs>
      </HiddenTabsContainer>
      {children}
    </Container>
  )
}

export default DashboardLayout
