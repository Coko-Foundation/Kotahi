CREATE TABLE article_import_sources (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    server TEXT NOT NULL
);