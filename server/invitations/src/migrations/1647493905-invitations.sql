CREATE TABLE invitations (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_man_id FOREIGN KEY (manuscript_id) REFERENCES manuscript (id),
    purpose VARCHAR(255),
    to_email VARCHAR(255),
    status VARCHAR(255)
);
