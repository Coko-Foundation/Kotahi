ALTER TABLE invitations ADD is_shared BOOLEAN DEFAULT false;
UPDATE invitations SET is_shared = false;
ALTER TABLE invitations ALTER COLUMN is_shared SET NOT NULL;
