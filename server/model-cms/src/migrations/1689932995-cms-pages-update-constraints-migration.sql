ALTER TABLE cms_pages
ADD CONSTRAINT cms_pages_url_group_id_key UNIQUE (url, group_id);

ALTER TABLE cms_pages
DROP CONSTRAINT cms_pages_url_key;