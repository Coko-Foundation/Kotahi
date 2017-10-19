import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider as StoreProvider } from 'react-redux'
import { Router } from 'react-router-dom'
import { configureStore } from 'pubsweet-client'
import createHistory from 'history/createBrowserHistory'
import { JournalProvider } from 'xpub-journal'
import * as journal from './config/journal'
import Root from './routes'
import 'xpub-fonts'
import 'xpub-theme'

const history = createHistory()
const store = configureStore(history, {})

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <StoreProvider store={store}>
        <JournalProvider journal={journal}>
          <Router history={history}>
            <Root/>
          </Router>
        </JournalProvider>
      </StoreProvider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept('./routes', () => {
    render()
  })
}
