import React from 'react'
// import { Router, createMemoryHistory } from 'react-router'
import { Provider } from 'react-redux'
import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'

import 'xpub-fonts'
import classes from './Wrapper.local.css'

const rootReducer = combineReducers({
  form: formReducer
})

const store = createStore(rootReducer)

const Wrapper = ({ children }) => (
  <Provider store={store}>
    <div className={classes.root}>
      {children}
    </div>
  </Provider>
)

/*const Wrapper = ({ children }) => (
  <Provider store={store}>
    <Router history={createMemoryHistory()}>
      <div className={classes.root}>
        {children}
      </div>
    </Router>
  </Provider>
)*/

export default Wrapper
