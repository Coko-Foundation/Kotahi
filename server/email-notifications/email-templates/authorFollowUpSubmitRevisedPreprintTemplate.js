const AuthorFollowUpSubmitRevisedPreprintTemplate = ({
  receiverName,
  currentUser,
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'We welcome submission of your revised preprint'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>Thank you for supporting Biophysics Colab and our mission to improve how research is evaluated by making our peer review report and your response to the comments publicly available.</p>
      <p>If you wish to seek further advice from our reviewing team on a revised version of your preprint, simply log in to our platform and click on ‘create new version’. The same action can be used if you would like us to curate a final version of your preprint by posting an evaluation statement on bioRxiv and Sciety. If this final version of your work addresses the points we outlined as essential in our consolidated report, we’d be happy to add our endorsement to the evaluation and include the work in our list of <a href="https://sciety.org/lists/5ac3a439-e5c6-4b15-b109-92928a740812" target="_blank">endorsed articles on Sciety</a>.</p>
      <p>We look forward to hearing how you would like to proceed.</p>
      <p>Best regards<br/>${currentUser}</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = AuthorFollowUpSubmitRevisedPreprintTemplate
