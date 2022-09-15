UPDATE manuscripts SET is_hidden = false where is_hidden is NULL;
ALTER TABLE manuscripts ALTER is_hidden SET NOT NULL;

ALTER TABLE manuscripts ALTER is_hidden SET DEFAULT false;
