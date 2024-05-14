ALTER TABLE article_import_history 
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES groups (id);