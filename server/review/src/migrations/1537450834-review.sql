CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    recommendation TEXT,
    is_decision BOOLEAN DEFAULT FALSE,
    comments JSONB,
    user_id UUID,
    manuscript_id UUID,
    type TEXT NOT NULL
);