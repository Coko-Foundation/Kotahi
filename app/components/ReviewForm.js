import React from 'react'
import PropTypes from 'prop-types'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'

const ReviewForm = ({ role, onSubmit }) => (
  <FRC.Form onSubmit={onSubmit} validateOnSubmit={true} layout="vertical" className="content-interactive">
    <div>
      <FRC.Textarea name="review" label="Review" rows={5}/>
    </div>

    <div style={{ marginTop: 20 }}>
      <Button type="submit" bsStyle="primary">Submit review</Button>
    </div>
  </FRC.Form>
)

ReviewForm.propTypes = {
  role: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default ReviewForm
