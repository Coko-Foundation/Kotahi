ALTER TABLE groups
  ADD CONSTRAINT groups_name_unique UNIQUE (name);