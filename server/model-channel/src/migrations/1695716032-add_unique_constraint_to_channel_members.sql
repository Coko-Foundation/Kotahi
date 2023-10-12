-- delete duplicate rows in channel members having same channel_id and user_id, keep only one row
DELETE FROM channel_members a
WHERE a.ctid NOT IN (
  SELECT min(b.ctid)
  FROM channel_members b
  WHERE a.user_id = b.user_id
  AND a.channel_id = b.channel_id
  GROUP BY user_id, channel_id
);

DROP INDEX IF EXISTS channel_members_idx;

ALTER TABLE channel_members
ADD CONSTRAINT channel_members_idx UNIQUE (channel_id, user_id);
