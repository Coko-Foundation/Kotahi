ALTER TABLE manuscripts ADD form_fields_to_publish JSONB DEFAULT '[]'::JSONB; -- JSON rather than a postgres array, since Objection expects JSON for arrays
UPDATE manuscripts SET form_fields_to_publish = '[]'::JSONB;
ALTER TABLE manuscripts ALTER COLUMN form_fields_to_publish SET NOT NULL;
