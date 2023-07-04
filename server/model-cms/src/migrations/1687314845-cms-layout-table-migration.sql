CREATE TABLE cms_layouts(
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  active bool NOT NULL DEFAULT false,
  primary_color TEXT,
  secondary_color TEXT,
  logo_id UUID REFERENCES files(id) on delete set null,
  header_config jsonb DEFAULT '{}'::jsonb,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
);


ALTER TABLE cms_pages
ADD COLUMN sequence_index INT NOT NULL DEFAULT 0,
ADD COLUMN menu bool NOT NULL DEFAULT false;