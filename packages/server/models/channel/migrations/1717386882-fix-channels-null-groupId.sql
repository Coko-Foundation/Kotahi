-- Set channels.group_id where it is missing, and make it non-nullable for future.

UPDATE channels
SET group_id = manuscripts.group_id
FROM manuscripts
WHERE channels.manuscript_id = manuscripts.id
  AND channels.group_id IS NULL;

ALTER TABLE channels
ALTER COLUMN group_id SET NOT NULL;
