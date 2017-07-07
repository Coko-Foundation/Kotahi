import React from 'react'
import PropTypes from 'prop-types'
import * as date from '../lib/date'
import * as sort from '../lib/sort'
import './EventsList.css'

// TODO: sort on the server and use a cursor for fetching?
const sortByDate = sort.descending('created')

const EventsList = ({ project, events }) => (
  <div className="content-metadata">
    {events.sort(sortByDate).map(event => (
      <div key={event.id} className="event">
        <div>{date.format(event.created)}</div>
      </div>
    ))}
  </div>
)

EventsList.propTypes = {
  project: PropTypes.object.isRequired,
  events: PropTypes.array.isRequired
}

export default EventsList
