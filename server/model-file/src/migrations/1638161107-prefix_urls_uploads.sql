-- Replace prefix to all URLs that has '/static/uploads' with '/uploads'
UPDATE files
set url = REPLACE(url,'/static/uploads','/uploads')
where url like '/static/uploads/%';