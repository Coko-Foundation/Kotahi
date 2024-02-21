CREATE TABLE IF NOT EXISTS published_artifacts (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT,
  title TEXT,
  content TEXT,
  hosted_in_kotahi BOOLEAN NOT NULL DEFAULT false,
  related_document_uri TEXT,
  related_document_type TEXT
);

CREATE INDEX published_artifacts_manuscript_id_idx ON published_artifacts(manuscript_id);

