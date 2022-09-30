const ReminderReviewOverdueTemplate = ({
  authorName,
  currentUser,
  receiverName,
}) => {
  const result = {}

  result.cc = 'lesley@sciencecolab.org'
  result.subject = 'Your reviewer’s report for Biophysics Colab'
  result.content = `
    <p>Dear ${receiverName}</p>

    <p>Thank you again for agreeing to review the preprint by ${authorName} and colleagues. We look forward to receiving your report at the earliest convenience.</p>
     
    <p>Don’t hesitate to contact me if you have any questions about the review process. </p>
     
    <p>
      Best regards <br />
    ${currentUser}
    </p>
     
    <p>
      On behalf of Biophysics Colab <br />
      <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
    </p>
  `

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = ReminderReviewOverdueTemplate
