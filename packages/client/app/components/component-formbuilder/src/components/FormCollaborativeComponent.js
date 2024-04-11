import React from 'react'
import CollaborativeWax from '../../../wax-collab/src/CollaborativeWax'

const FormCollaborateComponent =
  component =>
  ({ onChange, collaborativeObject, name, ...rest }) => {
    const { identifier } = collaborativeObject

    return (
      <CollaborativeWax
        component={component}
        editorMode={null}
        identifier={`${identifier}-${name}`}
        {...rest}
        collaborativeObject={collaborativeObject}
        onChange={() => {
          onChange(`${identifier}-${name}`)
        }}
      />
    )
  }

export default FormCollaborateComponent
