const AuthorInvitationEmailTemplate = ({
  articleTitle,
  appUrl,
  currentUser,
  invitationId,
  receiverName,
  instance,
}) => {
  const result = {
    cc: '',
    subject: 'Kotahi Notificaion Email',
    content: '',
  }

  switch (instance) {
    case 'colab':
      result.cc = 'lesley@sciencecolab.org, swartzk@ninds.nih.gov'
      result.subject =
        'Interest in your preprint from Biophysics Colab (in partnership with eLife)'
      result.content = `<p>
          <p>Dear ${receiverName}</p>
          <p>
            I'm writing to tell you about a new project that I hope you’ll be interested in, and offer you an opportunity to get involved.
          </p>
          <p>
          I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.
          </p>
          <p>
            We were interested to read your recent preprint “${articleTitle}” and would be grateful for an opportunity to review it. We would share our consolidated feedback with you at the earliest convenience, then offer you the opportunity to associate it with your preprint on bioRxiv and eLife’s <a href="https://sciety.org/groups/biophysics-colab/lists" target="_blank">Sciety</a> platform. You would be under no obligation to publicly share the report, but we hope you will choose to do so.
          </p>
          <p>
            Your agreement to our service would not constitute submission to a journal therefore you would be at liberty to submit your paper for review elsewhere. Indeed, we realise you may have already done so, and this would not preclude your participation in our scheme. Furthermore, some authors have found that <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a> have facilitated publication of their studies in traditional journals.
          </p>
          <p>
            Would you be interested in receiving expert feedback on your preprint? If so, please accept our invitation using the link below and include any suggestions for potential reviewers in the text box. If not, we’d be grateful if you let us know via the decline link. We’d be happy to arrange a video call if you’d like to learn more about Biophysics Colab before making a decision.
          </p>
          <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
          <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
          <p>
            Please note that you will require an ORCID account in order to log in to our platform. If you don’t already have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
          </p>
          <p>
            I look forward to hearing from you.
          </p>
          <p>
            Best regards <br>
            ${currentUser}
          </p>
          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`
      break
    default:
      result.cc = ''
      result.subject = 'Kotahi | Permission to review'
      result.content = `<p>Dear ${receiverName},</p>
        <p>
          The manuscript titled ‘${articleTitle}’ has been selected for peer review. Click on the link below to accept or decline the invitation;
        <p>
        <p><a href="${appUrl}/acceptarticle/${invitationId}" target="_blank">Accept invitation</a></p>
        <p><a href="${appUrl}/decline/${invitationId}" target="_blank">Decline invitation</a></p>
        <p>
          Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
          Your invitation id is ‘${invitationId}’
        </p>
        <p>
          Regards, <br>
          Kotahi team
        </p>`
  }

  result.content = result.content.replace(/\n/g, '')

  return result
}

module.exports = AuthorInvitationEmailTemplate
