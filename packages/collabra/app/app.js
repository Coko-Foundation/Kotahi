import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './Root'
import routes from './routes'
import * as journal from './config/journal'
import 'xpub-fonts'

const render = routes => {
  ReactDOM.render(
    <AppContainer>
      <Root routes={routes} journal={journal}/>
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
