

ALTER TABLE tasks 
    ADD assignee_type TEXT,
    ADD assignee_name TEXT,
    ADD assignee_email TEXT;
    

UPDATE tasks SET assignee_type='registeredUser' WHERE assignee_type IS NULL;
