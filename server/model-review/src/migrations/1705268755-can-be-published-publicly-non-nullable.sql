update reviews set can_be_published_publicly = false where can_be_published_publicly is null;
ALTER TABLE reviews ALTER COLUMN can_be_published_publicly SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN can_be_published_publicly SET DEFAULT FALSE;
