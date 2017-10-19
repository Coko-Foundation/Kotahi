import React from 'react'
import { Provider } from 'react-redux'
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
    <JournalProvider journal={journal}>
      <div className={classes.root}>
        {children}
      </div>
    </JournalProvider>
  </Provider>
)

export default Wrapper
