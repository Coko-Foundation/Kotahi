CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,

  name TEXT,
  role TEXT NOT NULL,
  members JSONB,
  owners JSONB,
  global BOOLEAN,
  type TEXT NOT NULL
);

ALTER TABLE teams
ADD manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'teams' 
          AND column_name = 'display_name'
    ) THEN
        EXECUTE 'ALTER TABLE teams RENAME COLUMN display_name TO name';
    END IF;
END $$;

CREATE INDEX ON teams (manuscript_id);

CREATE TABLE aliases (
    id uuid NOT NULL PRIMARY KEY,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name TEXT,
    email TEXT,
    aff TEXT
);

CREATE TABLE team_members (
    id uuid NOT NULL PRIMARY KEY,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(255),
    team_id uuid REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    alias_id uuid REFERENCES aliases(id)
);

CREATE INDEX ON team_members (team_id, user_id);