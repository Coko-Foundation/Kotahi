CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  channel_id uuid NOT NULL REFERENCES channels(id),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  content TEXT,
);
