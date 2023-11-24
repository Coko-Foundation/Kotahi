CREATE TABLE article_templates (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    group_id UUID REFERENCES groups(id),
    type TEXT NOT NULL,
    name TEXT DEFAULT null,
    article TEXT DEFAULT null,
    css TEXT DEFAULT null
);