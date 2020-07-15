CREATE TABLE teams (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  object JSONB,
  name TEXT,
  role TEXT NOT NULL,
  members JSONB,
  owners JSONB,
  global BOOLEAN,
  type TEXT NOT NULL
);