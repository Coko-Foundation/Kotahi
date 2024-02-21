ALTER TABLE forms 
  ADD category TEXT NULL;

UPDATE forms SET category = 'submission';
