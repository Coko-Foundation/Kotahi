ALTER TABLE email_blacklist 
  DROP CONSTRAINT IF EXISTS fk_group_id,
  ADD CONSTRAINT email_blacklist_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups (id);