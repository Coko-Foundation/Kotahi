import React from 'react'
import { Provider as StoreProvider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from 'pubsweet-client'
import { JournalProvider } from 'xpub-journal'

const store = configureStore(browserHistory, {})
const history = syncHistoryWithStore(browserHistory, store)

export default ({ routes, journal }) => (
  <StoreProvider store={store}>
    <JournalProvider journal={journal}>
      <Router history={history}>
        {routes}
      </Router>
    </JournalProvider>
  </StoreProvider>
)
