-- Allow both manuscript_id and review_comment_id simultaneously.
ALTER TABLE files DROP CONSTRAINT IF EXISTS exactly_one_file_owner;

-- Derive the manuscript_id for any files that don't have it
UPDATE files SET manuscript_id = (
  SELECT manuscript_id
  FROM review_comments c, reviews r
  WHERE c.id = files.review_comment_id
  AND c.review_id = r.id
) WHERE manuscript_id IS NULL AND review_comment_id IS NOT NULL;

-- Give file_type a value of 'review', 'confidential' or 'decision', taken from review_comments.comment_type
UPDATE files SET file_type = (SELECT comment_type from review_comments c where files.review_comment_id = c.id) WHERE file_type IS NULL;

-- There should now be no files without manuscript_id, file_type, filename, url or size. For paranoia's sake, ensure this is true
DELETE FROM files WHERE manuscript_id IS NULL OR file_type IS NULL OR filename IS NULL OR url IS NULL OR size IS NULL;

ALTER TABLE files ALTER manuscript_id SET NOT NULL;
ALTER TABLE files ALTER file_type SET NOT NULL;
ALTER TABLE files ALTER filename SET NOT NULL;
ALTER TABLE files ALTER url SET NOT NULL;
ALTER TABLE files ALTER size SET NOT NULL;
