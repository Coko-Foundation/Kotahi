-- This substantially speeds up some queries on Dashboard and Manuscripts pages
CREATE INDEX manuscripts_parent_id_idx ON manuscripts(parent_id);