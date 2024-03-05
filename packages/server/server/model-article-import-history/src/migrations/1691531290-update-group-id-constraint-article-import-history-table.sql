ALTER TABLE article_import_history 
  DROP CONSTRAINT IF EXISTS fk_group_id,
  ADD CONSTRAINT article_import_history_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups (id);