ALTER TABLE manuscripts 
  ADD is_imported BOOLEAN, 
  ADD import_source UUID, 
  ADD import_source_server TEXT,
  ADD CONSTRAINT fk_import_source FOREIGN KEY (import_source) REFERENCES article_import_sources (id);
