ALTER TABLE forms 
  DROP CONSTRAINT IF EXISTS fk_group_id,
  ADD CONSTRAINT forms_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups (id);