CREATE TABLE IF NOT EXISTS docmaps (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- typically this will be a DOI
  content TEXT -- the docmap JSON
);

CREATE INDEX IF NOT EXISTS docmaps_external_id_idx ON docmaps(external_id);
