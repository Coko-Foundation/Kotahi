CREATE TABLE review_comments (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    -- If a review is deleted for some reason, we want its comments to go away too
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    -- If a user is deleted, it's likely we want to keep the comments they have made
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT,
    comment_type TEXT,
    type TEXT
);