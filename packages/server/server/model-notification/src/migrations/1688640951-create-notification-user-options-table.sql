CREATE TABLE notification_user_options (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  object_id UUID,
  path TEXT[] NOT NULL,
  option TEXT,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);
