const EvaluationPublishedEmailTemplate = ({ receiverName, authorName }) => {
  const result = {
    cc: '',
    subject: '',
    content: '',
  }

  result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
  result.subject = 'Evaluation from Biophysics Colab now published'
  result.content = `<p>
    <p>Dear ${receiverName}</p>
  
  <p>The evaluation for the preprint by ${authorName} and colleagues has now been published.</p>
   
  <p>Thank you</p>
  <p>
    On behalf of Biophysics Colab <br>
    <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
  <p>`

  result.content = result.content.replace(/\n/g, '')
  return result
}

module.exports = EvaluationPublishedEmailTemplate
