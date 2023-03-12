const ReportPublishedTemplate = ({
  receiverName,
  authorName,
}) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Report(s) for Biophysics Colab available to view'
  result.content = `<p>
      <p>Dear ${receiverName}</p>
      <p>The report for the preprint by ${authorName} and colleagues has now been published and can be viewed in the list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">articles evaluated by Biophysics Colab</a>.</p>
      <p>Thank you</p>
      <p>
        On behalf of Biophysics Colab <br>
        <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
      <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = ReportPublishedTemplate
