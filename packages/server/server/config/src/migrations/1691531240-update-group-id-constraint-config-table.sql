ALTER TABLE configs 
  DROP CONSTRAINT IF EXISTS fk_group_id,
  ADD CONSTRAINT configs_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups (id);