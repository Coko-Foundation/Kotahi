CREATE TABLE configs (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    form_data JSONB,
    active BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL
);