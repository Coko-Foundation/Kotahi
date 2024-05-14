CREATE TABLE article_import_history (
    id UUID PRIMARY KEY,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    date TIMESTAMP WITH TIME ZONE,
    source_id UUID NOT NULL,
    CONSTRAINT fk_source_id FOREIGN KEY (source_id) REFERENCES article_import_sources (id)
);