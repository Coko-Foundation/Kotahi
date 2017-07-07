import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import EventsList from '../components/EventsList'
import { selectCollection } from '../lib/selectors'

const EventsListContainer = ({ project, events }) => {
  if (!project) return null
  if (!events.length) return null

  return <EventsList project={project} events={events}/>
}

EventsListContainer.propTypes = {
  project: PropTypes.object.isRequired,
  events: PropTypes.array.isRequired // TODO: organise by type?
}

export default connect(
  (state, ownProps) => {
    const project = selectCollection(state, ownProps.params.project)

    const events = project.events

    return { project, events }
  }
)(EventsListContainer)
