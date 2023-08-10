ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS cms_pages_url_group_id_key;

ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_url_group_id_key UNIQUE (url, group_id);

ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS cms_pages_url_key;