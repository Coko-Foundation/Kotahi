ALTER TABLE invitations
DROP CONSTRAINT fk_man_id,
ADD CONSTRAINT fk_man_id FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id) ON DELETE CASCADE; 