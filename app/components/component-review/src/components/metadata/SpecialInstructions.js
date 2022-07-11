import React from 'react'
import PropTypes from 'prop-types'
import { SectionRowGrid, Heading, Cell } from '../style'

const getNote = (notes, type) =>
  notes.find(note => note.notesType === type) || {}

const SpecialInstructions = ({ manuscript }) => (
  <SectionRowGrid>
    <Heading>Special Instructions</Heading>
    <Cell>
      {getNote(manuscript?.meta?.notes || [], 'specialInstructions').content ||
        'None'}
    </Cell>
  </SectionRowGrid>
)

SpecialInstructions.propTypes = {
  manuscript: PropTypes.shape({
    meta: PropTypes.shape({
      notes: PropTypes.arrayOf(
        PropTypes.shape({
          notesType: PropTypes.string.isRequired,
          content: PropTypes.string.isRequired,
        }).isRequired,
      ),
    }).isRequired,
  }).isRequired,
}

export default SpecialInstructions
