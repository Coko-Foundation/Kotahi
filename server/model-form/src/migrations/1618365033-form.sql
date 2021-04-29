CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS forms (
    id UUID NOT NULL DEFAULT public.gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'form',
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE,
    purpose TEXT NOT NULL,
    structure JSONB NOT NULL,
    CONSTRAINT pkey_forms PRIMARY KEY (id)
);