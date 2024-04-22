CREATE TABLE publishing_collections (
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  manuscripts jsonb NOT NULL default '[]',
  form_data JSONB,
  active BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL,
  group_id UUID REFERENCES groups(id)
);
