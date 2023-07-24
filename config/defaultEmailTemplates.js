module.exports = [
  {
    emailTemplateKey: 'genericTaskNotificationEmailTemplate',
    description: 'Task notification',
    subject: 'Kotahi | Task notification',
    ccEditors: false,
    body: `<p>
        <p>Dear {{ recipientName }}</p>
        <p>A task requires your attention<br />
        {{{ manuscriptLink }}}
        </p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
  },
  {
    emailTemplateKey: 'authorInvitationEmailTemplate',
    description: 'Author Invitation',
    subject: 'Kotahi | Permission to review',
    ccEditors: false,
    type: 'authorInvitation',
    body: `<p>Dear {{ recipientName }},</p>
        <p>
          The manuscript titled “{{ manuscriptTitle }}” has been selected for peer review. Click on the link below to accept or decline the invitation;
        </p>
        <p>{{{ acceptInviteLink }}}</p>
        <p>{{{ declineInviteLink }}}</a></p>
        <p>
        Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
        </p>
        <p>
        Regards, <br>
        Kotahi team
      </p>`,
  },
  {
    emailTemplateKey: 'reviewerInvitationEmailTemplate',
    description: 'Reviewer Invitation',
    subject: 'Kotahi | Reviewer invitation',
    ccEditors: false,
    type: 'reviewerInvitation',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              You have been selected to peer review the manuscript titled “{{ manuscriptTitle }}”. Click on the link below to accept or decline the invitation;
          </p>
          <p>{{{ acceptInviteLink }}}</p>
          <p>{{{ declineInviteLink }}}</a></p>
          <p>
              Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
          </p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
  {
    emailTemplateKey: 'chatNotification',
    description: 'Chat notification',
    subject: 'Kotahi | Discussion notification',
    ccEditors: false,
    type: 'systemEmail',
    body: `<p>
        <p>Dear {{ recipientName }}</p>

        <p>You have new discussion messages. Click here to reply; {{{ discussionUrl }}}</p>
        <p>Want to change your notifications settings? Login to Kotahi and go to your profile page<br></p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
  },
]
