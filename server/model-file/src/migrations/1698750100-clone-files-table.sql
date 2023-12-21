CREATE TABLE IF NOT EXISTS files_backup (LIKE files);
INSERT INTO
  files_backup
SELECT
  *
FROM
  files;