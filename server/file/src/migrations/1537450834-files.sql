CREATE TABLE files (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    object TEXT, 
    object_id UUID,
    label TEXT,
    file_type TEXT,
    filename TEXT,
    url TEXT,
    mime_type TEXT,
    size INTEGER,
    type TEXT NOT NULL
);