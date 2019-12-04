import 'regenerator-runtime/runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import { Root } from 'pubsweet-client'
import { createBrowserHistory } from 'history'
import theme from '@pubsweet/coko-theme'

import { JournalProvider } from './components/xpub-journal'
import { XpubProvider } from './components/xpub-with-context'

import * as journal from './config/journal'
import routes from './routes'

const history = createBrowserHistory()

const rootEl = document.getElementById('root')

ReactDOM.render(
  <XpubProvider>
    <JournalProvider journal={journal}>
      <Root history={history} routes={routes} theme={theme} />
    </JournalProvider>
  </XpubProvider>,
  rootEl,
)

export default hot(module)(Root)
