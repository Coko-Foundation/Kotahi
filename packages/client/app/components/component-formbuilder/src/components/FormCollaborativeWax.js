import React from 'react'
import CollaborativeWax from '../../../wax-collab/src/CollaborativeWax'

const FormCollaborateComponent = component =>
  function ({ onChange, collaborativeObject, ...rest }) {
    const { identifier } = collaborativeObject

    return (
      <CollaborativeWax
        component={component}
        editorMode={null}
        identifier={identifier}
        {...rest}
        collaborativeObject={collaborativeObject}
        onChange={() => {
          onChange(`${identifier}-${rest.name}`)
        }}
      />
    )
  }

export default FormCollaborateComponent
