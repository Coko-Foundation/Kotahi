export default {
  questions: [
    {
      id: 'openData',
      legend: 'Data is open ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No/Not Applicable',
          value: 'no',
        },
      ],
      description:
        'The journal requires data be openly available, and our full policy is <a href="https://www.collabra.org/about/editorialpolicies/#open-data-open-analytic-methods-code-and-research-materials-transparency" target="_blank">here</a>. If you have exceptions that need to be considered, please click "No" and explain in your cover letter below. Please click N/A if your submission does not feature data.',
    },
    {
      id: 'previouslySubmitted',
      legend: 'Previously submitted ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No',
          value: 'no',
        },
      ],
      description:
        'Provide further details in your cover letter below, if necessary.',
    },
    {
      id: 'openPeerReview',
      legend: 'Open peer review ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No',
          value: 'no',
        },
      ],
      description:
        'Please read a description of our <a href="https://www.collabra.org/about/editorialpolicies/#open-peer-review" target="_blank">“Open Review”</a> option and select “Yes” if you choose this process.',
    },
    {
      id: 'streamlinedReview',
      legend: 'Streamlined review ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No',
          value: 'no',
        },
      ],
      description:
        'Please read a description of our <a href="https://www.collabra.org/about/editorialpolicies/#streamlined-review" target="_blank">“Streamlined Review”</a> option and select “Yes” if you choose this process. If “Yes”, please upload your ported decision letter and reviews as “Supplementary Files” below, clearly labeled.',
    },
    {
      id: 'researchNexus',
      legend:
        'Submitted as part of the <a href="https://www.collabra.org/collections/special/" target="_blank">research nexus</a> ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No',
          value: 'no',
        },
      ],
      description:
        'If yes, mention the name of the Research Nexus in your cover letter below.',
    },
    {
      id: 'preregistered',
      legend: 'Pre-registered ?',
      options: [
        {
          label: 'Yes',
          value: 'yes',
        },
        {
          label: 'No',
          value: 'no',
        },
      ],
      description:
        'If any or all elements of your study have been pre-registered, click yes and ensure details are in the Acknowledgements section of your manuscript, following these <a href="https://www.collabra.org/about/editorialpolicies/#preregistration-of-studies-and-analysis-plans" target="_blank">guidelines</a>.',
    },
  ],
}
