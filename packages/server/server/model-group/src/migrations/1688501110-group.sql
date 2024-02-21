CREATE TABLE groups (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    name TEXT,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL
);