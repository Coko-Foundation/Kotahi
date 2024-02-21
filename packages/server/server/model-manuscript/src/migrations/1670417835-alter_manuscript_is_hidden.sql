-- altering column definition to only contain two values: FALSE (default) and TRUE
ALTER TABLE manuscripts ALTER COLUMN is_hidden SET DEFAULT FALSE;

-- update values for existing manuscripts
UPDATE manuscripts SET is_hidden=FALSE WHERE is_hidden IS NULL;
