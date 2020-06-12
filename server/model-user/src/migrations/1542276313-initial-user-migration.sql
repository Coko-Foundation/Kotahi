CREATE TABLE users (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  admin BOOLEAN,
  email TEXT,
  username TEXT,
  password_hash TEXT,
  fragments JSONB,
  collections JSONB,
  teams JSONB,
  password_reset_token TEXT,
  password_reset_timestamp TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL
);