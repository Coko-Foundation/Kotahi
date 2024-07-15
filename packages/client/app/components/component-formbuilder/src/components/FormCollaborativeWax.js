import React from 'react'
import CollaborativeWax from '../../../wax-collab/src/CollaborativeWax'

const FormCollaborateComponent =
  component =>
  // eslint-disable-next-line react/function-component-definition
  ({ onChange, collaborativeObject, ...rest }) => {
    const { identifier } = collaborativeObject

    return (
      <CollaborativeWax
        component={component}
        editorMode={null}
        identifier={identifier}
        {...rest}
        collaborativeObject={collaborativeObject}
      />
    )
  }

export default FormCollaborateComponent
