import React from 'react'
// import { Router, createMemoryHistory } from 'react-router'
import { Provider } from 'react-redux'
import { reducer as formReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux'

import 'xpub-fonts'
import './Wrapper.scss'
import classes from './Wrapper.local.css'

/*const Wrapper = ({ children }) => (
  <Router history={createMemoryHistory()}>
    <div className={classes.root}>
      {children}
    </div>
  </Router>
)*/

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

export default Wrapper
