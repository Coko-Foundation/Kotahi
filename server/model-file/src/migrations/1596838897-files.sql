CREATE TABLE files (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    object_type TEXT,
    object_id UUID,
    label TEXT,
    file_type TEXT,
    filename TEXT,
    url TEXT,
    mime_type TEXT,
    size INTEGER,
    type TEXT NOT NULL,
    -- Things that can have files
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    review_comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE,

    constraint exactly_one_file_owner check(
      (
        (manuscript_id is not null)::integer +
        (review_comment_id is not null)::integer
      ) = 1
    )
);