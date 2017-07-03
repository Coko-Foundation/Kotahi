import React from 'react'
import PropTypes from 'prop-types'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'

const ReviewerInvitationForm = ({ role, onSubmit }) => (
  <FRC.Form onSubmit={onSubmit} validateOnSubmit={true} layout="vertical" className="content-interactive">
    <div>
      <FRC.Textarea name="invitation" label="Invitation" rows={5}/>
    </div>

    <div style={{ marginTop: 20 }}>
      <Button type="submit" bsStyle="primary" disabled={role.status === 'invited'}>Send invitation</Button>
    </div>
  </FRC.Form>
)

ReviewerInvitationForm.propTypes = {
  role: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default ReviewerInvitationForm
