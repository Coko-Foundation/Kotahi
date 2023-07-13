CREATE TABLE cms_layouts (
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  active bool DEFAULT false,
  primary_color TEXT,
  secondary_color TEXT,
  logo_id UUID REFERENCES files(id) on delete set null,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE
);
