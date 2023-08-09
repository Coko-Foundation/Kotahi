ALTER TABLE docmaps 
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD CONSTRAINT docmaps_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups (id);