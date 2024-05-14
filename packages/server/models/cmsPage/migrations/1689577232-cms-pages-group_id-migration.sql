delete from cms_pages;
delete from cms_layouts;

ALTER TABLE cms_layouts
ADD COLUMN group_id UUID NOT NULL REFERENCES groups(id);

ALTER TABLE cms_pages
ADD COLUMN group_id UUID NOT NULL REFERENCES groups(id);