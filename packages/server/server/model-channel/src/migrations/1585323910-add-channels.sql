CREATE TABLE channels (
  id UUID PRIMARY KEY,
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  topic TEXT,
  type TEXT
);

CREATE TABLE channel_members (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channels(id)
);

CREATE INDEX channel_members_idx ON channel_members (user_id, channel_id);