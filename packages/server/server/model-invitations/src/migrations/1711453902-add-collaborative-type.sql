DROP table IF EXISTS invitations;
DROP type IF EXISTS invitation_type;
CREATE TYPE invitation_type AS enum ('AUTHOR','REVIEWER', 'COLLABORATIVE_REVIEWER');

CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    manuscript_id UUID NOT NULL,
        CONSTRAINT fk_man_id FOREIGN KEY (manuscript_id) REFERENCES manuscripts (id),
    purpose TEXT,
    to_email TEXT NOT NULL,
    status invitation_status NOT NULL,
    invited_person_type invitation_type NOT NULL,
    invited_person_name TEXT NOT NULL,
    response_date TIMESTAMP WITH TIME ZONE,
    response_comment TEXT,
    declined_reason invitation_declined_reason_type ,
    user_id UUID, 
        CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id),
    sender_id UUID NOT NULL,
        CONSTRAINT fk_sender_id FOREIGN KEY (sender_id) REFERENCES users (id)
);