import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'
import { JournalProvider } from 'xpub-journal'
import * as journal from '../config/journal'

import 'xpub-fonts'
import 'xpub-theme'

import classes from './Wrapper.local.scss'

const rootReducer = combineReducers({
  form: formReducer
})

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

const Wrapper = ({ children }) => (
  <Provider store={store}>
    <Router>
      <JournalProvider journal={journal}>
        <div className={classes.root}>
          {children}
        </div>
      </JournalProvider>
    </Router>
  </Provider>
)

export default Wrapper
