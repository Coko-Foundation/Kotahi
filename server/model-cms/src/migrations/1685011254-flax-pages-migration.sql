CREATE TABLE flax_pages (
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  shortcode TEXT NOT NULL,
  title TEXT,
  content JSONB,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE 
);

INSERT INTO "public"."flax_pages" ("title", "shortcode", "content", "created", "updated") VALUES
('About us Page', 'about_us', '{"body": "", "footer": "", "header": ""}', '2023-05-25 10:42:40.317133+00', '2023-05-29 14:57:02.316+00');