import React from 'react'
import PropTypes from 'prop-types'
import { withContext, getContext } from 'recompose'

export const JournalProvider = withContext(
  { journal: PropTypes.object },
  ({ journal }) => ({ journal })
)(props => React.Children.only(props.children))

export const withJournal = getContext({
  journal: PropTypes.object
})
