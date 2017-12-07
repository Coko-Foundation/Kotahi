import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import createHistory from 'history/createBrowserHistory'

import { configureStore, Root } from 'pubsweet-client'
import { JournalProvider } from 'xpub-journal'
import 'xpub-theme'

import * as journal from './config/journal'
import Routes from './routes'

const history = createHistory()
const store = configureStore(history, {})
const theme = {}

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <JournalProvider journal={journal}>
        <Root
          history={history}
          routes={<Routes />}
          store={store}
          theme={theme}
        />
      </JournalProvider>
    </AppContainer>,
    document.getElementById('root'),
  )
}

render()

if (module.hot) {
  module.hot.accept('./routes', () => {
    render()
  })
}
