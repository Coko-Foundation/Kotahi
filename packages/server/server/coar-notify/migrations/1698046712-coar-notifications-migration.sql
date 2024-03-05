CREATE TABLE coar_notifications (
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  payload JSONB,
  manuscript_id UUID,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  group_id UUID
);