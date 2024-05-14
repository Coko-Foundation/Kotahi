CREATE TABLE IF NOT EXISTS threaded_discussions (
  id uuid NOT NULL,
  created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  manuscript_id uuid NOT NULL,
  threads JSONB NOT NULL
);

ALTER TABLE threaded_discussions
  ADD CONSTRAINT threaded_discussions_manuscript_id_fkey FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id) ON DELETE CASCADE;