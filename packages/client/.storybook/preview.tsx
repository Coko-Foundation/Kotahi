/* eslint-disable import/no-extraneous-dependencies */

import { definePreview, type Decorator } from '@storybook/react-vite'
import addonDocs from '@storybook/addon-docs'

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { I18nextProvider } from 'react-i18next'
import { App, ConfigProvider } from 'antd'

import { makeTheme } from '../app/theme'
import GlobalStyle from '../app/theme/elements/GlobalStyle'
import i18next from '../app/i18n'

const theme = makeTheme()

/**
 * Duplicate what coko client does with the ant theme, since it's not directly
 * exported.
 */
const pxToNumber = (value: unknown): number | undefined => {
  if (typeof value === 'string' && value.slice(-2) === 'px') {
    return parseInt(value.slice(0, -2), 10)
  }

  return typeof value === 'number' ? value : undefined
}

const antTokens = Object.fromEntries(
  Object.entries({
    borderRadius: pxToNumber(theme.borderRadius),
    colorBgBase: theme.colorBackground,
    colorTextBase: theme.colorText,
    fontFamily: theme.fontInterface,
    fontSize: pxToNumber(theme.fontSizeBase),
    fontSizeHeading1: pxToNumber(theme.fontSizeHeading1),
    fontSizeHeading2: pxToNumber(theme.fontSizeHeading2),
    fontSizeHeading3: pxToNumber(theme.fontSizeHeading3),
    fontSizeHeading4: pxToNumber(theme.fontSizeHeading4),
    fontSizeHeading5: pxToNumber(theme.fontSizeHeading5),
    fontSizeHeading6: pxToNumber(theme.fontSizeHeading6),
    lineType: theme.borderStyle,
    lineWidth: pxToNumber(theme.borderWidth),
    motionUnit: theme.transitionDuration,
    sizeUnit: pxToNumber(theme.gridUnit),
  }).filter(([, value]) => !!value),
)

const antTheme = { token: { ...theme, ...antTokens } }

const withProviders: Decorator = (Story, context) => {
  const initialEntries = context.parameters?.router?.initialEntries ?? ['/']
  const routePath = context.parameters?.router?.path

  const content = (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18next}>
        <ConfigProvider theme={antTheme}>
          <App
            notification={{
              stack: false,
              showProgress: true,
              pauseOnHover: true,
              duration: 4,
            }}
          >
            <GlobalStyle />
            <div
              onClick={e => {
                const anchor = (e.target as HTMLElement).closest('a')
                if (anchor) {
                  /* eslint-disable-next-line no-console */
                  console.log('navigate to:', anchor.getAttribute('href'))
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  const anchor = (e.target as HTMLElement).closest('a')
                  if (anchor) {
                    /* eslint-disable-next-line no-console */
                    console.log('navigate to:', anchor.getAttribute('href'))
                  }
                }
              }}
              role="presentation"
            >
              <Story />
            </div>
          </App>
        </ConfigProvider>
      </I18nextProvider>
    </ThemeProvider>
  )

  return (
    <MemoryRouter initialEntries={initialEntries}>
      {routePath ? (
        <Routes>
          <Route element={content} path={routePath} />
        </Routes>
      ) : (
        content
      )}
    </MemoryRouter>
  )
}

export default definePreview({
  addons: [addonDocs()],
  tags: ['autodocs'],
  decorators: [withProviders],
})
