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



INSERT INTO "public"."cms_pages" ("id", "shortcode", "url", "title", "status", "content", "meta", "created", "updated", "published", "edited") VALUES
('0f1b67ac-f0b1-487a-94bc-ca3dc92e2761', 'about_us', '/aboutus/', 'About us', 'published', '<p class="paragraph">This is updated</p><p class="paragraph">See <a href="/contactus/" rel="" target="blank">contact us page</a></p>', '{"url": "/aboutus/", "menu": true, "order": 1}', '2023-06-05 14:08:17.947243+00', '2023-06-12 13:44:58.206+00', '2023-06-12 13:44:58.188+00', '2023-06-12 13:44:52.486+00'),
('0f1b67ac-f0b1-487a-94bc-ca3dc92e2771', 'contact_us', '/contactus/',  'Contact us', 'published', '<p class="paragraph"><strong>This is updated</strong></p>', '{"url": "/contactus/", "shownInMenu": true, "order": 2}', '2023-06-05 14:08:17.947243+00', '2023-06-12 13:45:15.719+00', '2023-06-12 13:45:15.711+00', '2023-06-12 13:45:15.573+00');