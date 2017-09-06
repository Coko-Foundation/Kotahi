import React from 'react'
import { Provider } from 'react-redux'
import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'
import { JournalProvider } from 'pubsweet-component-xpub-app'
import journal from '../config/journal'

import 'xpub-fonts'
import classes from './Wrapper.local.scss'

const rootReducer = combineReducers({
  form: formReducer
})

const store = createStore(rootReducer)

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
