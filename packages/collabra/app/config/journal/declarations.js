import React from 'react'

export default {
  valid: model => !!model.accept, // TODO: use form validation instead?
  sections: [
    {
      name: 'Ethics',
      items: [
        {
          name: 'human',
          type: 'checkbox',
          label: 'This research included study of human participants or human tissue',
          render: value => (
            <div>This research {value ? 'included' : 'did not include'} study of human participants or human tissue.</div>
          )
        },
        {
          name: 'humanReview',
          type: 'text',
          // label: 'Institutional review board',
          helperText: 'Please name the Institutional Review Board which approved this research',
          condition: model => model.human,
          required: true,
          render: value => (
            <div>
              <div>The Institutional Review Board which approved this research:</div>
              <div>{value}</div>
            </div>
          )
        }
      ]
    },
    {
      name: 'Influence',
      items: [
        {
          name: 'financialDisclosure',
          type: 'text',
          // label: 'Funding disclosure',
          helperText: 'Please disclose any role that the funders played in your research and/or manuscript',
          render: value => (
            <div>
              <div>Roles that the funders played in the research and/or manuscript:</div>
              <div>{value}</div>
            </div>
          )
        }
      ]
    },
    {
      name: 'Discoveries',
      items: [
        {
          name: 'newTaxon',
          type: 'checkbox',
          label: 'This paper describes a new taxon',
          content: value => (
            value && <div>Please review <a href="https://submit.elifesciences.org/html/elife_author_instructions.html" target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>our policies on new taxon nomenclature.</a></div>
          ),
          render: value => (
            <div>This research {value ? 'describes' : 'does not describe'} a new taxon.</div>
          )
        }
      ]
    },
    {
      name: 'Terms & Conditions',
      items: [
        {
          name: 'accept',
          type: 'checkbox',
          required: true,
          label: 'By checking this box, I accept the terms and conditions', // TODO: link
          render: value => (
            <div>The terms and conditions {value ? 'were' : 'were not'} accepted.</div>
          )
        }
      ]
    },
  ]
}
