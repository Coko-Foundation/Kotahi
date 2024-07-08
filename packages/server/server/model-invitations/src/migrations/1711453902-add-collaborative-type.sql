/* Temporary update column type */
ALTER TABLE invitations ALTER COLUMN invited_person_type TYPE varchar(20);

DROP type IF EXISTS invitation_type;
CREATE TYPE invitation_type AS enum ('AUTHOR','REVIEWER', 'COLLABORATIVE_REVIEWER');

ALTER TABLE invitations ALTER COLUMN invited_person_type TYPE invitation_type USING invited_person_type::invitation_type;
