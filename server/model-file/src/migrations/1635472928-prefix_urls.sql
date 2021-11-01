-- Add a prefix to all URLs that don't already have it
UPDATE files SET url = '/static/uploads'||url
WHERE url NOT LIKE '/static/uploads/%';
