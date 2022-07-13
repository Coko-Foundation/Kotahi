-- Record the old object_ids in case we need to roll back
CREATE TABLE files_old_2 (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    type text NOT NULL,
    name text NOT NULL,
    stored_objects JSONB NOT NULL,
    tags JSONB,
    reference_id uuid,
    object_id uuid,
    alt text,
    upload_status text,
    caption text
);
INSERT INTO files_old_2 SELECT * FROM files;

-- files previously belonged to an intermediate reviewComment object;
-- we will discard that object so they are directly owned by the review.
UPDATE files SET object_id = rc.review_id FROM review_comments rc WHERE files.object_id = rc.id;

-- Move the old schema reviews table out of the way
ALTER TABLE reviews RENAME TO reviews_old;
ALTER TABLE reviews_old DROP CONSTRAINT reviews_pkey CASCADE;
ALTER TABLE reviews_old DROP CONSTRAINT reviews_manuscript_id_fkey;

-- Create new reviews table 
CREATE TABLE reviews (
    id uuid NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated timestamp with time zone,
    is_decision boolean DEFAULT false,
    user_id uuid,
    manuscript_id uuid,
    type text NOT NULL,
    is_hidden_from_author boolean,
    is_hidden_reviewer_name boolean,
    can_be_published_publicly boolean,
    json_data JSONB
);
ALTER TABLE reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE reviews ADD CONSTRAINT reviews_manuscript_id_fkey FOREIGN KEY (manuscript_id)
  REFERENCES manuscripts(id) ON DELETE CASCADE;

-- Insert records with JSONB generated
INSERT INTO reviews (
  SELECT r.id, r.created, r.updated, r.is_decision,
    r.user_id, r.manuscript_id, r.type, r.is_hidden_from_author,
    r.is_hidden_reviewer_name, r.can_be_published_publicly,
    CASE
    WHEN r.is_decision THEN
      json_build_object(
        'comment', d.content,
        'files', (SELECT to_jsonb(x)->'array_agg' FROM (
          SELECT array_agg(id) FROM files WHERE object_id = r.id and tags @> '"decision"'
        ) x),
        'verdict', CASE WHEN r.recommendation = 'accepted' THEN 'accept' WHEN r.recommendation = 'rejected' THEN 'reject' ELSE r.recommendation END
      )::JSONB 
    ELSE
      json_build_object(
        'comment', c.content,
        'files', (SELECT to_jsonb(y)->'array_agg' FROM (
          SELECT array_agg(id) FROM files WHERE object_id = r.id and tags @> '"review"'
        ) y),
        'confidentialComment', conf_c.content,
        'confidentialFiles', (SELECT to_jsonb(z)->'array_agg' FROM (
          SELECT array_agg(id) FROM files WHERE object_id = r.id and tags @> '"confidential"'
        ) z),
        'verdict', CASE WHEN r.recommendation = 'accepted' THEN 'accept' WHEN r.recommendation = 'rejected' THEN 'reject' ELSE r.recommendation END
      )::JSONB 
    END
      as json_data
  FROM reviews_old r
  LEFT JOIN review_comments c ON (c.review_id = r.id AND c.comment_type = 'review')
  LEFT JOIN review_comments conf_c ON (conf_c.review_id = r.id AND conf_c.comment_type = 'confidential')
  LEFT JOIN review_comments d ON (d.review_id = r.id AND d.comment_type = 'decision')
) ON CONFLICT DO NOTHING;

-- Remove old decision and review forms so the revised forms will be added
delete from forms where category in ('review', 'decision');