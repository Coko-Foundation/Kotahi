CREATE TABLE identities (
  id UUID PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL, -- local, orcid
  identifier TEXT, -- e.g. orcid ID
  name TEXT,
  aff TEXT,
  oauth JSONB,
  is_default BOOLEAN
);

CREATE UNIQUE INDEX is_default_idx ON identities (is_default, user_id) WHERE is_default IS true;



