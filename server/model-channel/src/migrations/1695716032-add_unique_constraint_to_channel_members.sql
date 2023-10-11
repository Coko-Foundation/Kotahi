DROP INDEX IF EXISTS channel_members_idx;

ALTER TABLE channel_members
ADD CONSTRAINT channel_members_idx UNIQUE (channel_id, user_id);
