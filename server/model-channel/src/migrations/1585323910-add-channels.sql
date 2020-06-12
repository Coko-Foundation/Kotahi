CREATE TABLE channels (
  id UUID PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  team_id uuid REFERENCES teams(id),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  name TEXT,
  topic TEXT,
  type TEXT
);

CREATE TABLE channel_members (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  user_id uuid NOT NULL REFERENCES users(id),
  channel_id uuid NOT NULL REFERENCES channels(id)
);

CREATE INDEX channel_members_idx ON channel_members (user_id, channel_id);