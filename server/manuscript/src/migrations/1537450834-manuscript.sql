CREATE TABLE manuscripts (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    parent_id UUID,
    status TEXT,
    decision TEXT,
    authors JSONB,
    suggestions JSONB,
    meta JSONB,
    type TEXT NOT NULL
);