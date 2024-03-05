DROP TABLE IF EXISTS flax_pages;

-- Todo: I don't think the default is probably needed, if you're 
-- accessing this via the model, because the BaseModel deals 
-- with this. I know that doesn't help with SQL migrations, but they migrations can explicitly use gen_random_uuid whenever they need.
-- We have the same implementation on few other palaces as well. We need to remove this from those places as well

CREATE TABLE cms_pages(
  id UUID NOT NULL DEFAULT public.gen_random_uuid(),
  shortcode TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  meta JSONB,
  creator_id UUID REFERENCES users(id),
  published TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  edited TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);