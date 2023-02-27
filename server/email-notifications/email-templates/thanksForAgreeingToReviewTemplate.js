const ThanksForAgreeingTemplate = ({ authorName, currentUser }) => {
  const result = {}

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Thank you for supporting Biophysics Colab'
  result.content = `
    <p>Thank you for agreeing to review the preprint by ${authorName} and colleagues for Biophysics Colab. I look forward to receiving your report, formatted as described below, by the agreed date.</p>

    <p>When all the reviewers have submitted their feedback, I’ll begin to consolidate the advice into a single report that we can discuss as a reviewing group (either electronically or via a video call). You can decide whether to sign this consolidated report after it has been finalised.</p>

    <p>We respectfully ask that you treat the consolidated report as a confidential document until it is publicly associated with the preprint, and we will ask the authors to do the same.</p>

    <p>I look forward to receiving your advice.</p>

    <p>
      Best regards <br />
      ${currentUser}
    </p>

    <p>
      On behalf of Biophysics Colab <br />
      <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p>
    <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>
    <p style="margin-top: 2px;">Our primary goal is to deliver objective feedback on published preprints that is independent of the criteria applied by conventional journals. Our reports detail three types of recommendation: revisions that we consider to be essential for the results to support the conclusions; optional suggestions for the authors to consider; and minor corrections or presentational issues (see below). All these recommendations should help to strengthen the manuscript, but authors can decide which advice to follow. If a revised preprint addresses the revisions that we define as essential, we offer to publicly endorse the work. <br /> <br />
      <u>General assessment</u>: <br />
      Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
      &nbsp;&nbsp; -   	The objectives of the study <br />
      &nbsp;&nbsp; -   	Key findings and major conclusions <br />
      &nbsp;&nbsp; -   	Your opinion of its strengths and weaknesses <br /> <br />
      <u>Recommendations</u>: <br />
      Please list recommendations for improving the rigour and credibility of the work under the following three categories: <br />
      &nbsp;&nbsp; -   	Essential revisions <br />
      &nbsp;&nbsp; -   	Optional suggestions <br />
      &nbsp;&nbsp; -   	Minor and presentational issues <br /> <br />
      <u>Your relevant expertise</u>: <br />
      Please succinctly state your relevant expertise (we will not reveal your name if you prefer to remain anonymous).
    </p>
  `

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ThanksForAgreeingTemplate
