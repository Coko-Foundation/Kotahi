ALTER TABLE manuscripts ADD submitted_date TIMESTAMP WITH TIME ZONE;
UPDATE manuscripts SET submitted_date = created WHERE status != 'new';