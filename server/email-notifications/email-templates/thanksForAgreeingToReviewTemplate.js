const ThanksForAgreeingTemplate = ({ authorName, currentUser }) => {
  const result = {}

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Thank you for supporting Biophysics Colab'
  result.content = `
    <p>Thank you for agreeing to review the preprint by ${authorName} and colleagues for Biophysics Colab. We look forward to receiving your report, formatted as described below, by the agreed date. </p>
     
    <p>Once all the reports have been received, I’ll begin to consolidate them into a single report that we can discuss as a reviewing group (either electronically or via a video call). You can decide whether to sign this consolidated report after it has been finalized.</p>
     
    <p>We respectfully ask that you treat the consolidated report as a confidential document until it is publicly associated with the preprint, and we will ask the authors to do the same.</p>
     
    <p>I look forward to receiving your advice.</p>
     
    <p>
      Best regards <br />
      ${currentUser}
    </p>
     
    <p>
      On behalf of Biophysics Colab <br />
      <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p> <br />

    <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>
    <p style="margin-top: 2px;">
      Our primary goal is to provide a service for authors by delivering objective feedback that is independent of the criteria applied by conventional journals, but which provides recommendations to strengthen the interpretation of the data. The collaborative process, which borrows heavily from that used at eLife, will involve a video or email discussion to agree upon a consolidated report. <br />
      <u>General assessment</u>: <br />
      Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
      &nbsp;&nbsp; -   	The objectives of the study <br />
      &nbsp;&nbsp; -   	Key findings and major conclusions <br />
      &nbsp;&nbsp; -   	Your opinion of its strengths and weaknesses <br />
      <u>Recommendations</u>:
      Please list your recommendations for improving the rigour and credibility of the work under the following three categories: <br />
      &nbsp;&nbsp; -   	Revisions essential for your endorsement <br />
      &nbsp;&nbsp; -   	Additional suggestions for the authors to consider <br />
      &nbsp;&nbsp; -   	Minor corrections and presentational issues <br />
      <u>Your relevant expertise</u>: <br />
      Please succinctly state your relevant expertise (your name will be revealed if you give us permission to do so).
    </p>
  `

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ThanksForAgreeingTemplate
