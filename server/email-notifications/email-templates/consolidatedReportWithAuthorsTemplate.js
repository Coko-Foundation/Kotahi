const ConsolidatedReportWithAuthorsTemplate = ({
  receiverName,
  currentUser,
  authorName,
  manuscriptPageUrl,
  appUrl,
  ccEmails = [],
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = `lesley@sciencecolab.org, swartzk@ninds.nih.gov`

  if (ccEmails.length) {
    const ccEmailRecipients = ccEmails.join(', ')
    result.cc += `, ${ccEmailRecipients}`
  }

  result.subject = 'Report from Biophysics Colab'
  result.content = `<p>
      <p>Dear ${receiverName}</p>

      <p>Thank you for the opportunity to review your recent preprint “${authorName}”.</p>

      <p>I’m pleased to let you know that experts in the field have now reviewed and discussed the work, and have approved a consolidated report that you can view at <a href="${manuscriptPageUrl}">${manuscriptPageUrl}</a>.</p>

      <p>You’ll see that we have not made any judgements about the suitability of your study for a particular journal, but have articulated its strengths and provided feedback that we believe will tighten its interpretation. I’d be happy to discuss the points we’ve raised, particularly if there’s been a misunderstanding.</p>

      <p>After considering our advice, we recommend that you take three actions:</p>

      <ol>
        <li>
          <p>Make the report publicly available</p>
          <p>We hope you’ll agree that it will be informative for other researchers to post our consolidated report on bioRxiv and highlight your work and our feedback in our list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">evaluated articles on Sciety</a>. You can request this using the chat function after logging in to our platform and we will arrange for the report (including the names of all signatories but excluding minor and presentational issues) to be posted at the earliest opportunity.</p>
          <p>Of course, you are under no obligation to make the report public and can instead request that it remain confidential. Please note, however, that we ask our reviewers to treat the consolidated report as a confidential document until the point of public posting, and therefore ask that you share it only with your co-authors until such a time.</p>
        </li>
        <li>
          <p>Post your response to the report</p>
          <p>We would naturally be happy to post your response to the reviewers’ comments alongside the consolidated report on both bioRxiv and Sciety; simply provide your response after logging in to our platform (${appUrl}) and we will post it at the first opportunity. Please use “block quote" from the drop-down styling menu to quote from our report.</p>
        </li>
        <li>
          <p>Submit a revised preprint for curation</p>
          <p>We anticipate that you will want to revise your manuscript after reading our advice and encourage you to upload any revision as a revised preprint. This will provide us with an opportunity to ‘curate’ your study by posting our overall evaluation of the work, as we have outlined in the preliminary evaluation statement available at ${appUrl}. If you are ready to finalise your work in this way, please log in to our platform and click on ‘Submit new version’ so that we can revise our evaluation statement appropriately and post it on bioRxiv and Sciety. If your revision addresses the essential revisions outlined in our consolidated report, we’ll add our endorsement to the evaluation and include the study in our list of <a href="https://sciety.org/lists/5ac3a439-e5c6-4b15-b109-92928a740812" target="_blank">endorsed articles on Sciety</a>.</p>
        </li>
      </ol>
      <p>Alternatively, if you would like further advice from our reviewing team before finalising your study, simply request that when you upload your revised preprint using the chat function.</p>
      <p>Thank you for the opportunity to review your interesting preprint.</p>
      <p></p>
      <p>Best regards<br/>${currentUser}</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = ConsolidatedReportWithAuthorsTemplate
