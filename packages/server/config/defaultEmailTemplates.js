module.exports = [
  {
    emailTemplateKey: 'genericTaskNotificationEmailTemplate',
    description: 'Task notification',
    subject: 'Kotahi | Task notification',
    ccEditors: false,
    body: `<p>
        <p>Dear {{ recipientName }},</p>
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
        <p>Dear {{ recipientName }},</p>

        <p>You have new discussion messages. Click here to reply; {{{ discussionUrl }}}</p>
        <p>Want to change your notifications settings? Login to Kotahi and go to your profile page<br></p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
  },
  {
    emailTemplateKey: 'authorProofingInvitationEmailTemplate',
    description: 'Author proofing invitation',
    subject: 'Kotahi | You’ve been assigned to proof {{ manuscriptTitle }}',
    ccEditors: false,
    type: 'authorProofingInvitation',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              You have been assigned to participate in a round of author proofing. Click here to access the manuscript and feedback form;
          </p>
          <p>{{{ manuscriptProductionLink }}}</p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
  {
    emailTemplateKey: 'authorProofingSubmittedEmailTemplate',
    description: 'Author proofing submitted',
    subject:
      'Kotahi | {{ senderName }} has completed proofing {{ manuscriptTitle }}',
    ccEditors: false,
    type: 'authorProofingSubmitted',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              An author you have assigned has completed a round of author proofing. Click here to access the manuscript and feedback form;
          </p>
          <p>{{{ manuscriptProductionLink }}}</p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
  {
    emailTemplateKey: 'collaboratorAccessGrantedEmailTemplate',
    description: 'Collaborator access granted for article',
    subject:
      'Kotahi | Collaborator access to {{ manuscriptTitle }} has been granted',
    ccEditors: false,
    type: 'collaboratorAccessGranted',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              Your access to “{{ manuscriptTitle }}” has been granted by {{ authorName }}. You can now {{ accessType }} this article. Click here to view:
          </p>
          <p>{{{ manuscriptLink }}}</p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
  {
    emailTemplateKey: 'collaboratorAccessChangeEmailTemplate',
    description: 'Collaborator access changed for article',
    subject:
      'Kotahi | Collaborator access to {{ manuscriptTitle }} has been changed',
    ccEditors: false,
    type: 'collaboratorAccessChanged',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              Your access to “{{ manuscriptTitle }}” has been changed. You can now {{ accessType }} this article. Click here to view: 
          </p>
          <p>{{{ manuscriptLink }}}</p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
  {
    emailTemplateKey: 'collaboratorAccessRemovedEmailTemplate',
    description: 'Collaborator access removed for article',
    subject:
      'Kotahi | Collaborator access to {{ manuscriptTitle }} has been removed',
    ccEditors: false,
    type: 'collaboratorAccessRemoved',
    body: `
        <p>
          <p>Dear {{ recipientName }},</p>
          <p>
              Your access to “{{ manuscriptTitle }}” has been removed by {{ authorName }}. 
          </p>
          <p>
              Regards, <br>
              Kotahi team
          </p>
      </p>`,
  },
]
