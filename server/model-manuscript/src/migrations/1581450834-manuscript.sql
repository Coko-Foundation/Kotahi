CREATE TABLE manuscripts (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    parent_id UUID,
    submitter_id UUID REFERENCES users(id),
    status TEXT,
    decision TEXT,
    authors JSONB,
    suggestions JSONB,
    meta JSONB,
    submission JSONB,
    published TIMESTAMP WITH TIME ZONE,
    type TEXT NOT NULL
);