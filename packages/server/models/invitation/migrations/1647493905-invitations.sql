create type invitation_status as enum ('UNANSWERED','ACCEPTED','REJECTED');

CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    manuscript_id UUID not null,
        CONSTRAINT fk_man_id FOREIGN KEY (manuscript_id) REFERENCES manuscripts (id),
    purpose VARCHAR(255),
    to_email VARCHAR(255) not null,
    status invitation_status not null,
    sender_id UUID not null,
        CONSTRAINT fk_sender_id FOREIGN KEY (sender_id) REFERENCES users (id)
);