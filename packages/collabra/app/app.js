import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from 'pubsweet-client'
import routes from './routes'
import 'xpub-fonts'

const store = configureStore(browserHistory, {})
const history = syncHistoryWithStore(browserHistory, store)

const render = routes => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Router history={history}>
          {routes}
        </Router>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(routes)

if (module.hot) {
  module.hot.accept('./routes', () => {
    render(routes)
  })
}
