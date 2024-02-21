CREATE TABLE notification_digest (
  id UUID PRIMARY KEY,
  created TIMESTAMPTZ NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMPTZ,
  time TIMESTAMPTZ NOT NULL,
  max_notification_time TIMESTAMPTZ NOT NULL,
  path_string TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  option TEXT,
  actioned BOOLEAN DEFAULT false,
  context JSONB,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);
