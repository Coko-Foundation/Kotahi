CREATE TABLE cms_file_templates (
  id UUID PRIMARY KEY NOT NULL DEFAULT public.gen_random_uuid(),
  name TEXT,
  group_id UUID REFERENCES groups(id) NOT NULL,
  file_id UUID REFERENCES files(id) on delete set null,
  parent_id UUID,
  root_folder BOOLEAN NOT NULL DEFAULT false,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE
);
