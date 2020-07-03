import React from 'react'
import { find } from 'lodash'
import { compose, withHandlers, withState } from 'recompose'
import { Button, Menu } from '@pubsweet/ui'

const TeamCreator = ({
  teamTypeSelected,
  manuscriptSelected,
  manuscriptsOptions,
  typesOptions,
  onChangeManuscript,
  onChangeType,
  onSave,
}) => (
  <form onSubmit={onSave}>
    <h3>Create a new team</h3>
    <h4>Team type</h4>
    <Menu
      name="teamType"
      onChange={onChangeType}
      options={typesOptions}
      required
      reset={teamTypeSelected}
      value={teamTypeSelected}
    />
    <h4>Manuscript</h4>
    <Menu
      name="collection"
      onChange={onChangeManuscript}
      options={manuscriptsOptions}
      required
      reset={manuscriptSelected}
      value={manuscriptSelected}
    />
    <Button primary type="submit">
      Create
    </Button>
  </form>
)

export default compose(
  withState('manuscriptSelected', 'onManuscriptSelect', false),
  withState('teamTypeSelected', 'onTeamTypeSelect', false),
  withHandlers({
    onChangeManuscript: ({ onManuscriptSelect }) => collectionId =>
      onManuscriptSelect(() => collectionId || false),
    onChangeType: ({ onTeamTypeSelect }) => teamType =>
      onTeamTypeSelect(() => teamType || false),
    onSave: ({
      teamTypeSelected,
      manuscriptSelected,
      create,
      typesOptions,
      onTeamTypeSelect,
      onManuscriptSelect,
    }) => event => {
      event.preventDefault()
      const role = teamTypeSelected

      let objectId
      let objectType

      if (manuscriptSelected) {
        objectId = manuscriptSelected
        objectType = 'Manuscript'
      }

      if (role && objectId && objectType) {
        create({
          name: find(typesOptions, types => types.value === role).label,
          role,
          objectId,
          objectType,
          members: [],
        })

        onTeamTypeSelect(() => true)
        onManuscriptSelect(() => true)
      }
    },
  }),
)(TeamCreator)
