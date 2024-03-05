import 'regenerator-runtime/runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import { createBrowserHistory } from 'history'
import Root from './Root'
// Theme import has been moved to AdminPage.js for implementing config based theme

// Models
import AssetManager from './components/asset-manager/src/AssetManagerPage'
import ModalProvider from './components/asset-manager/src/ui/Modal/ModalProvider'

import { JournalProvider } from './components/xpub-journal/src'
import { XpubProvider } from './components/xpub-with-context/src'

import * as journal from '../config/journal'

import './i18n'

const history = createBrowserHistory()

const rootEl = document.getElementById('root')

const modals = {
  assetManagerEditor: AssetManager,
}

ReactDOM.render(
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ModalProvider modals={modals}>
        <Root history={history} />
      </ModalProvider>
    </JournalProvider>
  </XpubProvider>,
  rootEl,
)

export default hot(module)(Root)
