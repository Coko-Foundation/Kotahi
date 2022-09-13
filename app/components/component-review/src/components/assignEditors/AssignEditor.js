import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Select } from '../../../../shared'

const editorOption = user => ({
  label: user.username || user.email,
  value: user.id,
})

const AssignEditor = ({
  teamRole,
  manuscript,
  allUsers,
  updateTeam,
  createTeam,
  teamLabels,
}) => {
  const [team, setTeam] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedEditor, setSelectedEditor] = useState(undefined)
  const [members, setMembers] = useState([])

  useEffect(() => {
    setTeam((manuscript.teams || []).find(t => t.role === teamRole) || {})
    setTeams(manuscript.teams || [])
  }, [manuscript])

  useEffect(() => {
    setTeam(teams.find(t => t.role === teamRole) || {})
  }, [teams])

  useEffect(() => {
    setMembers(team.members || [])
  }, [team])

  useEffect(() => {
    setSelectedEditor(members.length > 0 ? members[0].user.id : undefined)
  }, [members])

  useEffect(() => {
    if (selectedEditor) {
      if (teams.find(t => t.role === teamRole)) {
        updateTeam({
          variables: {
            id: team.id,
            input: {
              members: [{ user: { id: selectedEditor } }],
            },
          },
        })
      } else {
        const editor = teamRole === 'editor' ? 'Editor' : 'Handling Editor'

        const input = {
          // Editors are always linked to the parent manuscript
          objectId: manuscript.id,
          objectType: 'manuscript',
          name: teamRole === 'seniorEditor' ? 'Senior Editor' : editor,
          role: teamRole,
          members: [{ user: { id: selectedEditor } }],
        }

        createTeam({
          variables: {
            input,
          },
        }).then(({ data }) => {
          setTeams([
            ...teams,
            {
              id: data.createTeam.id,
              role: teamRole,
              members: [{ user: { id: selectedEditor } }],
            },
          ])
        })
      }
    }
  }, [selectedEditor])

  const teamName = teamLabels[teamRole].name
  const options = (allUsers || []).map(user => editorOption(user))

  return (
    <Select
      aria-label={`Assign ${teamRole}`}
      data-testid={`assign${teamRole}`}
      label={teamName}
      onChange={selected => setSelectedEditor(selected.value)}
      options={options}
      placeholder={`Assign ${teamName}…`}
      value={selectedEditor}
    />
  )
}

AssignEditor.propTypes = {
  teamRole: PropTypes.string.isRequired,
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

export default AssignEditor
