import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'

const RemoveProject = ({ onClick }) => (
  <Button bsSize="small" bsStyle="link" onClick={onClick}
          style={{ color: '#eee', background: 'none', position: 'fixed', top: 50, right: 50 }}>
    <span className="fa fa-remove"/>
  </Button>
)

RemoveProject.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default RemoveProject
